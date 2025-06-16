import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
const BACKEND_URL = "http://localhost:3000";

const topicMap = {
  Arrays: ["Prefix Sum", "Sliding Window", "Two Pointers"],
  Strings: ["KMP", "Z-Algorithm", "Trie"],
  Graphs: ["DFS", "BFS", "Dijkstra", "Topological Sort"],
  Trees: ["Binary Tree", "BST", "Segment Tree", "Fenwick Tree"],
  DP: ["0/1 Knapsack", "LIS", "Matrix DP"],
  Greedy: ["Activity Selection", "Huffman Coding"],
};

const Solved = () => {
  const username = localStorage.getItem("username");
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [newQn, setNewQn] = useState({
    questionName: "",
    topic: "Arrays",
    subtopic: "",
    difficulty: "Easy",
    link: "",
  });

  const fetchSolved = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/solved/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const solved = res.data.solved;
      setSolvedQuestions(solved);

      const stats = {
        totalSolved: solved.length,
        dailyStreak: 0,
        topicsMastered: [],
      };

      const topicSet = new Set();
      solved.forEach((q) => {
        if (q.topic) topicSet.add(q.topic);
      });
      stats.topicsMastered = Array.from(topicSet);

      const datesSolved = new Set(
        solved.map((q) => new Date(q.solvedAt).toISOString().split("T")[0])
      );

      let streak = 0;
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      while (datesSolved.has(today.toISOString().split("T")[0])) {
        streak++;
        today.setDate(today.getDate() - 1);
      }

      stats.dailyStreak = streak;

      setStats(stats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching solved questions:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolved();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newQn,
        username,
        subtopic: newQn.subtopic || null,
        solvedAt: new Date().toISOString(),
      };

      const res = await axios.post(`${BACKEND_URL}/solved/add`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setNewQn({
        questionName: "",
        topic: "Arrays",
        subtopic: "",
        difficulty: "Easy",
        link: "",
      });
      fetchSolved();
    } catch (err) {
      console.error("Error posting question:", err);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-indigo-50 to-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 tracking-wide drop-shadow-sm">
            Solved Questions
          </h1>

          {/* Add Solved Question Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-lg"
          >
            <input
              type="text"
              required
              placeholder="Question Name"
              value={newQn.questionName}
              onChange={(e) =>
                setNewQn({ ...newQn, questionName: e.target.value })
              }
              className="border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-3 text-gray-700 shadow-sm transition"
            />

            {/* Topic Dropdown */}
            <select
              value={newQn.topic}
              onChange={(e) =>
                setNewQn({ ...newQn, topic: e.target.value, subtopic: "" })
              }
              className="border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-3 text-gray-700 shadow-sm transition"
            >
              {Object.keys(topicMap).map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>

            {/* Subtopic Dropdown */}
            <select
              value={newQn.subtopic}
              onChange={(e) => setNewQn({ ...newQn, subtopic: e.target.value })}
              disabled={topicMap[newQn.topic]?.length === 0}
              className={`border border-gray-300 rounded-md p-3 shadow-sm transition focus:ring-indigo-500 focus:border-indigo-500 ${
                topicMap[newQn.topic]?.length === 0
                  ? "bg-gray-100 cursor-not-allowed text-gray-400"
                  : "text-gray-700"
              }`}
            >
              <option value="">None</option>
              {topicMap[newQn.topic]?.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={newQn.difficulty}
              onChange={(e) => setNewQn({ ...newQn, difficulty: e.target.value })}
              className="border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-3 text-gray-700 shadow-sm transition"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <input
              type="url"
              placeholder="Link to problem (optional)"
              value={newQn.link}
              onChange={(e) => setNewQn({ ...newQn, link: e.target.value })}
              className="border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-3 col-span-full text-gray-700 shadow-sm transition"
            />

            <button
              type="submit"
              className="col-span-full bg-indigo-600 text-white font-semibold rounded-md py-3 hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-lg"
            >
              Add Solved Question
            </button>
          </form>

          {/* Stats Section */}
          {loading ? (
            <div className="text-center text-gray-600 text-lg py-20">Loading...</div>
          ) : solvedQuestions.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-20">
              You haven't solved any questions yet.
            </div>
          ) : (
            <>
              <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-indigo-100 border border-indigo-300 p-6 rounded-xl shadow hover:shadow-lg transition">
                  <p className="text-sm font-medium text-indigo-700 uppercase tracking-wide">
                    Total Solved
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-indigo-900">
                    {stats.totalSolved}
                  </p>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-xl shadow hover:shadow-lg transition">
                  <p className="text-sm font-medium text-yellow-700 uppercase tracking-wide">
                    Current Streak
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-yellow-900">
                    {stats.dailyStreak} days
                  </p>
                </div>
                <div className="bg-green-100 border border-green-300 p-6 rounded-xl shadow hover:shadow-lg transition">
                  <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
                    Topics Mastered
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-green-900">
                    {stats.topicsMastered?.length || 0}
                  </p>
                </div>
              </section>

              {/* Solved Questions Table */}
              <section className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-indigo-50">
                    <tr>
                      {[
                        "Question",
                        "Topic",
                        "Subtopic",
                        "Difficulty",
                        "Date",
                        "Time",
                        "Link",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider select-none"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {solvedQuestions.map((q, index) => (
                      <tr
                        key={index}
                        className="hover:bg-indigo-50 cursor-default transition"
                      >
                        <td className="px-6 py-3 whitespace-nowrap text-gray-800 font-medium max-w-xs truncate" title={q.questionName}>
                          {q.questionName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{q.topic}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600 italic">{q.subtopic || "-"}</td>
                        <td
                          className={`px-6 py-3 whitespace-nowrap font-semibold ${
                            q.difficulty === "Easy"
                              ? "text-green-600"
                              : q.difficulty === "Medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {q.difficulty}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{formatDate(q.solvedAt)}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{formatTime(q.solvedAt)}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {q.link ? (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline hover:text-indigo-800 transition"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 select-none">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Solved;
