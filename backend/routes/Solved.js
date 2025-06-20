const express = require("express");
const Solved = require("../schema/Solved");
const router = express.Router();
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const checkAuth = require("../authentication/checkAuth");
const mongoose = require("mongoose");
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;
const leetcodebaseurl = "https://leetcode.com/problems";
const ai = new GoogleGenAI({ apiKey: API_KEY });
const input5 = `Arrays: ["Prefix Sum", "Sliding Window", "Two Pointers"],
  Strings: ["KMP", "Z-Algorithm", "Trie"],
  Graphs: ["DFS", "BFS", "Dijkstra", "Topological Sort"],
  Trees: ["Binary Tree", "BST", "Segment Tree", "Fenwick Tree"],
  DP: ["0/1 Knapsack", "LIS", "Matrix DP"],
  Greedy: ["Activity Selection", "Huffman Coding"]\n these are the topics and subtopics you should strictly use to classify the question.Your task is to add topic subtopic and difficulty by using ur brain\n`;
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
    res.status(200).json({
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

router.post("/sync-leetcode", checkAuth, async (req, res) => {
  try {
    const username = req.user.username;
    const leetcodeUsername = req.user.leetcode;

    if (!leetcodeUsername) {
      return res.status(400).json({ message: "LeetCode username is required" });
    }

    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `{
          recentAcSubmissionList(username: "${leetcodeUsername}") {
            id
            title
            titleSlug
            timestamp
          }
        }`,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const list = response.data.data.recentAcSubmissionList || [];
    if (list.length === 0) {
      return res
        .status(404)
        .json({ message: "No submissions found for this user" });
    }
    for (let i = 0; i < list.length; i++) {
      const questionName = list[i].title.trim().toUpperCase();
      const link = `${leetcodebaseurl}/${list[i].titleSlug}`;
      const solvedAt = new Date(list[i].timestamp * 1000).toISOString();
      const existingSolved = await Solved.findOne({
        username,
        questionName,
        solvedAt
      });
      if (existingSolved) {
        console.log("Question already exists:", questionName);
        continue;
      }
      const input1 = `I am giving u question name,link,solvedAt,username.You should return the output in strictly in json format\n`;
      const input2 = `username: ${username}, questionName: ${questionName}, link: ${link}, solvedAt: ${solvedAt}\n`;
      const input3 = `Output format(you must fill all field, Visit page and get qn if required.Ur an ai use ur brain to assign difficulty whether med easy or hard)\n`;
      const input4 = `{"username": "string", "questionName": "string", "topic": "string", "subtopic": "string", "difficulty": "string", "link": "string", "solvedAt": "Date"}`;
      const prompt = input1 + input5 + input2 + input3 + input4;
      const rest = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      //console.log(rest.candidates[0].content);
      const rawText = rest.text;
      const jsonString = rawText.replace(/```json|```/g, "").trim();
      //console.log(jsonString);
      const jsonData = JSON.parse(jsonString);
      //console.log(jsonData);

      const qn = await Solved.findOne({
        username,
        questionName: jsonData.questionName,
        topic: jsonData.topic,
        subtopic: jsonData.subtopic || null,
        difficulty: jsonData.difficulty,
      });
      if (qn) {
        await Solved.updateOne(
          { _id: qn._id },
          { $set: { solvedAt, link: link || "" } }
        );
        continue
      }
      const newSolved = new Solved({
        _id: new mongoose.Types.ObjectId(),
        username,
        questionName: jsonData.questionName,
        topic: jsonData.topic,
        subtopic: jsonData.subtopic || null,
        difficulty: jsonData.difficulty,
        link: link || "",
        solvedAt,
      });
      await newSolved.save();
      console.log("New question added:", jsonData.questionName);
    }

    res.status(200).json({
      message: "LeetCode submissions fetched successfully",
      list,
    });
  } catch (err) {
    console.error("Error syncing with LeetCode:", err);
    res.status(500).json({ message: "Failed to sync with LeetCode" });
  }
});

router.get("/sync-codeforces-stream", checkAuth, async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const username = req.user.username;
  const codeforcesHandle = req.user.codeforces;
  

  if (!codeforcesHandle) {
    res.write("data: Codeforces handle is required\n\n");
    return res.end();
  }

  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesHandle}&from=1&count=100`
    );

    const list = response.data.result || [];
    const accepted = list.filter((sub) => sub.verdict === "OK");

    if (accepted.length === 0) {
      res.write("data: No accepted submissions found\n\n");
      return res.end();
    }

    let addedCount = 0;
    for (let i = 0; i < accepted.length; i++) {
      const sub = accepted[i];
      const title = sub.problem.name.trim();
      const contestId = sub.problem.contestId;
      const index = sub.problem.index;
      const questionName = `${title} (${contestId}${index})`.toUpperCase();
      const link = `https://codeforces.com/contest/${contestId}/problem/${index}`;
      const solvedAt = new Date(sub.creationTimeSeconds * 1000).toISOString();
      const tags = sub.problem.tags.join(", ");

      const existingSolved = await Solved.findOne({
        username,
        questionName,
      });
      if (existingSolved) {
        existingSolved.solvedAt = solvedAt;
        continue;
      }

      const input1 = `I am giving u question name,link,solvedAt,username.You should return the output in strictly in json format\n`;
      const input2 = `username: ${username}, questionName: ${questionName}, link: ${link}, solvedAt: ${solvedAt}\n`;
      const input3 = `The tags for this problem are: ${tags}\n`;
      const input4 = `Output format (you must fill all fields. Visit page and get qn if required. You're an AI, use your brain to assign difficulty whether \"Medium\", \"Easy\" or \"Hard\", and assign topic/subtopic from the given dataset). Additional rule: If the problem is from a Div.2 contest and index is 'C' or later, or from a Div.3 contest and index is 'D' or later, then mark it as \"Hard\".\n`;
      const input6 = `{"username": "string", "questionName": "string", "topic": "string", "subtopic": "string", "difficulty": "string", "link": "string", "solvedAt": "Date"}`;
      const prompt = input1 + input2 + input3 + input4 + input5 + input6;

      try {
        const rest = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        const rawText = rest.text;
        const jsonString = rawText.replace(/```json|```/g, "").trim();
        const jsonData = JSON.parse(jsonString);

        const qn = await Solved.findOne({
          username,
          questionName: jsonData.questionName,
          topic: jsonData.topic,
          subtopic: jsonData.subtopic || null,
          difficulty: jsonData.difficulty,
        });

        if (!qn) {
          const newSolved = new Solved({
            _id: new mongoose.Types.ObjectId(),
            username,
            questionName: jsonData.questionName,
            topic: jsonData.topic,
            subtopic: jsonData.subtopic || null,
            difficulty: jsonData.difficulty,
            link: jsonData.link || link,
            solvedAt,
          }) 
          await newSolved.save();
          addedCount++;
        }else{
            console.log("Question already exists:", jsonData.questionName);
          };

        res.write(`data: Synced ${i + 1}/${accepted.length} (${jsonData.questionName})\n\n`);
      } catch (err) {
        console.error("Gemini error", err);
        res.write(`data: Skipped ${questionName} due to AI error\n\n`);
      }
    }

    res.write("data: DONE\n\n");
    res.end();
  } catch (err) {
    console.error("Codeforces SSE error:", err);
    res.write("data: Error syncing with Codeforces\n\n");
    res.end();
  }
});


module.exports = router;
