import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const BACKEND_URL = "https://dailydrill-dl2k.onrender.com";

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
  const [syncStatus, setSyncStatus] = useState("");

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

      await axios.post(`${BACKEND_URL}/solved/add`, payload, {
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

  const syncLeetCode = async () => {
    setSyncStatus("syncingLeetcode");
    try {
      await axios.post(`${BACKEND_URL}/solved/sync-leetcode`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchSolved();
      setSyncStatus("successLeetcode");
    } catch (err) {
      console.error("Error syncing LeetCode:", err);
      setSyncStatus("errorLeetcode");
    }
  };

  const syncCodeforces = () => {
    setSyncStatus("Starting Codeforces sync...");
    const eventSource = new EventSource(
      `${BACKEND_URL}/solved/sync-codeforces-stream?token=${localStorage.getItem("token")}`
    );

    eventSource.onmessage = (event) => {
      const msg = event.data;
      if (msg === "DONE") {
        setSyncStatus("successCodeforces");
        fetchSolved();
        eventSource.close();
      } else {
        setSyncStatus(msg);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setSyncStatus("errorCodeforces");
      eventSource.close();
    };
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-4xl font-extrabold text-indigo-700 tracking-wide drop-shadow-sm">
              Solved Questions
            </h1>

            <div className="flex gap-4">
              <button
                onClick={syncLeetCode}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                {syncStatus === "syncingLeetcode"
                  ? "Syncing LeetCode..."
                  : "Sync LeetCode"}
              </button>
              <button
                onClick={syncCodeforces}
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition"
              >
                Sync Codeforces
              </button>
            </div>
          </div>

          {syncStatus && (
            <p
              className={`mb-4 font-medium ${
                syncStatus.startsWith("success")
                  ? "text-green-600"
                  : syncStatus.startsWith("error")
                  ? "text-red-600"
                  : "text-gray-700"
              }`}
            >
              {syncStatus.startsWith("success")
                ? "Sync successful!"
                : syncStatus.startsWith("error")
                ? "Sync failed."
                : syncStatus}
            </p>
          )}

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
              className="border border-gray-300 rounded-md p-3 text-gray-700"
            />
            <select
              value={newQn.topic}
              onChange={(e) =>
                setNewQn({ ...newQn, topic: e.target.value, subtopic: "" })
              }
              className="border border-gray-300 rounded-md p-3 text-gray-700"
            >
              {Object.keys(topicMap).map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
            <select
              value={newQn.subtopic}
              onChange={(e) => setNewQn({ ...newQn, subtopic: e.target.value })}
              disabled={topicMap[newQn.topic]?.length === 0}
              className="border border-gray-300 rounded-md p-3 text-gray-700"
            >
              <option value="">None</option>
              {topicMap[newQn.topic]?.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>
            <select
              value={newQn.difficulty}
              onChange={(e) =>
                setNewQn({ ...newQn, difficulty: e.target.value })
              }
              className="border border-gray-300 rounded-md p-3 text-gray-700"
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
              className="border border-gray-300 rounded-md p-3 col-span-full text-gray-700"
            />
            <button
              type="submit"
              className="col-span-full bg-indigo-600 text-white font-semibold rounded-md py-3 hover:bg-indigo-700"
            >
              Add Solved Question
            </button>
          </form>

          {/* Stats Section */}
          {loading ? (
            <div className="text-center text-gray-600 text-lg py-20">
              Loading...
            </div>
          ) : solvedQuestions.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-20">
              You haven't solved any questions yet.
            </div>
          ) : (
            <>
              <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-indigo-100 p-6 rounded-xl shadow">
                  <p className="text-sm font-medium text-indigo-700">
                    Total Solved
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-indigo-900">
                    {stats.totalSolved}
                  </p>
                </div>
                <div className="bg-yellow-100 p-6 rounded-xl shadow">
                  <p className="text-sm font-medium text-yellow-700">
                    Current Streak
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-yellow-900">
                    {stats.dailyStreak} days
                  </p>
                </div>
                <div className="bg-green-100 p-6 rounded-xl shadow">
                  <p className="text-sm font-medium text-green-700">
                    Topics Mastered
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-green-900">
                    {stats.topicsMastered?.length || 0}
                  </p>
                </div>
              </section>

              {/* Solved Questions Table */}
              <section className="overflow-x-auto rounded-xl shadow-lg border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Subtopic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-600">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {solvedQuestions.map((q, i) => (
                      <tr key={i} className="hover:bg-indigo-50 transition">
                        <td className="px-6 py-3">{q.questionName}</td>
                        <td className="px-6 py-3">{q.topic}</td>
                        <td className="px-6 py-3">{q.subtopic || "-"}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-semibold ${
                              q.difficulty === "Easy"
                                ? "text-green-600"
                                : q.difficulty === "Medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-3">{formatDate(q.solvedAt)}</td>
                        <td className="px-6 py-3">{formatTime(q.solvedAt)}</td>
                        <td className="px-6 py-3">
                          {q.link ? (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 underline"
                            >
                              View
                            </a>
                          ) : (
                            "—"
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
