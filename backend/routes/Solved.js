const express = require("express");
const Solved = require("../schema/Solved");
const router = express.Router();
const checkAuth = require("../authentication/checkAuth");
const mongoose = require("mongoose");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/add", checkAuth, async (req, res) => {
  try {
    let { questionName, topic, subtopic, difficulty, link } = req.body;
    const username = req.user.username;
    const solvedAt = new Date().toISOString();

    // Convert question name to UPPER CASE
    questionName = questionName.trim().toUpperCase();

    const qn = await Solved.findOne({
      username,
      questionName,
      topic,
      subtopic: subtopic || null,
      difficulty,
    });

    if (qn) {
      await Solved.updateOne(
        { _id: qn._id },
        { $set: { solvedAt, link: link || "" } }
      );
      return res.status(200).json({ message: "Question updated successfully" });
    }

    const newSolved = new Solved({
      _id: new mongoose.Types.ObjectId(),
      username,
      questionName,
      topic,
      subtopic: subtopic || null,
      difficulty,
      link: link || "",
      solvedAt,
    });

    await newSolved.save();
    res.status(201).json({ message: "Question added successfully" });
  } catch (err) {
    console.error("Error adding solved question:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all", checkAuth, async (req, res) => {
  try {
    const username = req.user.username; // Assuming checkAuth attaches user to req
    const solvedQuestions = await Solved.find({ username }).sort({
      solvedAt: -1,
    });
    res
      .status(200)
      .json({
        message: "Question fetched successfully",
        solved: solvedQuestions,
      });
  } catch (err) {
    console.error("Error fetching solved questions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/stats", checkAuth, async (req, res) => {
  try {
    const username = req.user.username; // Assuming checkAuth attaches user to req
    const solved = await Solved.find({ username });

    const totalSolved = solved.length;

    // 🧠 Compute streak
    const dates = new Set(
      solved.map((q) => new Date(q.solvedAt).toISOString().slice(0, 10))
    );
    let streak = 0;
    let day = new Date();

    while (dates.has(day.toISOString().slice(0, 10))) {
      streak++;
      day.setDate(day.getDate() - 1);
    }

    // 🧠 Compute mastered topics (e.g., user solved at least one subtopic per topic)
    const topicCoverage = {};
    solved.forEach((q) => {
      if (!topicCoverage[q.topic]) topicCoverage[q.topic] = new Set();
      if (q.subtopic) topicCoverage[q.topic].add(q.subtopic);
    });

    const topicsMastered = Object.entries(topicCoverage)
      .filter(([topic, subs]) => subs.size >= 2) // Customize threshold
      .map(([topic]) => topic);

    res.json({
      totalSolved,
      dailyStreak: streak,
      topicsMastered,
    });
  } catch (err) {
    console.error("Error computing stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.get("/recommend", checkAuth, async (req, res) => {
//   try {
//     const username = req.user.username;
//     const now = new Date();

//     // 1. Get all questions solved by current user
//     const userSolved = await Solved.find({ username });
//     const solvedSet = new Set(userSolved.map((q) => q.questionName));

//     // 2. Get questions solved by other users (excluding current user)
//     const othersSolved = await Solved.find({ username: { $ne: username } });

//     // 3. Build a map of unsolved questions from others
//     const recMap = new Map(); // questionName -> latest { topic, subtopic, difficulty, link, solvedAt }

//     for (const q of othersSolved) {
//       if (!solvedSet.has(q.questionName)) {
//         if (
//           !recMap.has(q.questionName) ||
//           new Date(q.solvedAt) > new Date(recMap.get(q.questionName).solvedAt)
//         ) {
//           recMap.set(q.questionName, {
//             questionName: q.questionName,
//             topic: q.topic,
//             subtopic: q.subtopic,
//             difficulty: q.difficulty,
//             link: q.link,
//             solvedAt: q.solvedAt,
//           });
//         }
//       }
//     }

//     // 4. Score based on freshness and popularity (more users solving = higher score)
//     const freqMap = {};
//     othersSolved.forEach((q) => {
//       if (!solvedSet.has(q.questionName)) {
//         freqMap[q.questionName] = (freqMap[q.questionName] || 0) + 1;
//       }
//     });

//     const recommendations = [];

//     for (const [qn, details] of recMap.entries()) {
//       const daysAgo =
//         (now - new Date(details.solvedAt)) / (1000 * 60 * 60 * 24);
//       const freshnessScore = 1 / (1 + daysAgo);
//       const popularityScore = freqMap[qn] || 1;

//       const finalScore = 0.6 * popularityScore + 0.4 * freshnessScore;

//       recommendations.push({
//         ...details,
//         score: finalScore,
//       });
//     }

//     recommendations.sort((a, b) => b.score - a.score);

//     res.status(200).json({
//       message: "Recommended questions based on what others solved",
//       recommended: recommendations.slice(0, 10), // return top 10
//     });
//   } catch (err) {
//     console.error("Error in /recommend:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
const recommendationCache = new Map(); // username -> { recommended, date }

router.get("/recommend", checkAuth, async (req, res) => {
  try {
    const username = req.user.username;
    const today = new Date().toISOString().slice(0, 10);

    // Check if we have a cached recommendation for this user today
    if (
      recommendationCache.has(username) &&
      recommendationCache.get(username).date === today
    ) {
      const cached = recommendationCache.get(username);
      const solvedNow = await Solved.find({ username });
      const solvedSet = new Set(solvedNow.map((q) => q.questionName));

      const updated = cached.recommended.map((q) => ({
        ...q,
        solved: solvedSet.has(q.questionName),
      }));

      return res.status(200).json({
        message: "Cached recommendation for today",
        recommended: updated,
      });
    }

    const now = new Date();

    // Step 1: Get solved questions by current user
    const userSolved = await Solved.find({ username });
    const solvedSet = new Set(userSolved.map((q) => q.questionName));

    // Step 2: Get others' solved questions
    const othersSolved = await Solved.find({ username: { $ne: username } });

    // Step 3: Build map of unsolved questions
    const recMap = new Map();
    for (const q of othersSolved) {
      if (!solvedSet.has(q.questionName)) {
        if (
          !recMap.has(q.questionName) ||
          new Date(q.solvedAt) > new Date(recMap.get(q.questionName).solvedAt)
        ) {
          recMap.set(q.questionName, {
            questionName: q.questionName,
            topic: q.topic,
            subtopic: q.subtopic,
            difficulty: q.difficulty,
            link: q.link,
            solvedAt: q.solvedAt,
          });
        }
      }
    }

    // Step 4: Score and sort
    const freqMap = {};
    othersSolved.forEach((q) => {
      if (!solvedSet.has(q.questionName)) {
        freqMap[q.questionName] = (freqMap[q.questionName] || 0) + 1;
      }
    });

    const recommendations = [];
    for (const [qn, details] of recMap.entries()) {
      const daysAgo =
        (now - new Date(details.solvedAt)) / (1000 * 60 * 60 * 24);
      const freshnessScore = 1 / (1 + daysAgo);
      const popularityScore = freqMap[qn] || 1;
      const finalScore = 0.6 * popularityScore + 0.4 * freshnessScore;

      recommendations.push({
        ...details,
        score: finalScore,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    const top10 = recommendations.slice(0, 10);

    // Save in cache
    recommendationCache.set(username, {
      recommended: top10,
      date: today,
    });

    const solvedNow = await Solved.find({ username });
    const solvedSetNow = new Set(solvedNow.map((q) => q.questionName));

    const updated = top10.map((q) => ({
      ...q,
      solved: solvedSetNow.has(q.questionName),
    }));

    res.status(200).json({
      message: "New daily recommendation generated",
      recommended: updated,
    });
  } catch (err) {
    console.error("Error in /recommend:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
