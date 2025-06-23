import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Check, X } from "lucide-react"; // Icons for status

const BACKEND_URL = "http://localhost:3000";

const Recommended = () => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/solved/recommend`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(res.data);
      setRecommended(res.data.recommended || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-purple-50 to-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-purple-700 mb-4 tracking-wide drop-shadow-sm">
            Recommended Questions
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Here are your <span className="font-semibold text-purple-600">daily 10 personalized recommendations</span>.
          </p>

          {loading ? (
            <div className="text-center text-gray-600 text-lg py-20">
              Loading recommendations...
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-20">
              No recommendations yet. Solve some questions first!
            </div>
          ) : (
            <>
              <section className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-purple-50">
                    <tr>
                      {["Question", "Topic", "Subtopic", "Difficulty", "Link", "Status"].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-3 text-left text-xs font-semibold text-purple-600 uppercase tracking-wider select-none"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recommended.map((q, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-50 cursor-default transition"
                      >
                        <td
                          className="px-6 py-3 whitespace-nowrap text-gray-800 font-medium max-w-xs truncate"
                          title={q.questionName}
                        >
                          {q.questionName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                          {q.topic}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600 italic">
                          {q.subtopic || "-"}
                        </td>
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
                        <td className="px-6 py-3 whitespace-nowrap">
                          {q.link ? (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 underline hover:text-purple-800 transition"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 select-none">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                          {q.solved ? (
                           '✅'
                          ) : (
                            '❌'   
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Why these were recommended */}
              <div className="mt-10 bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700">
                <p className="mb-1 font-semibold text-purple-600">
                  Why these recommendations?
                </p>
                <p>
                  These are picked based on topics you've solved and what's trending among users like you.
                  Solving these helps reinforce concepts and improves your overall proficiency.
                </p>
              </div>

              {/* Recent topics grid */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-purple-700 mb-4">
                  Your Recently Solved Topics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Graphs", "Dynamic Programming", "Greedy"].map((topic, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                    >
                      <h3 className="text-purple-700 font-semibold mb-1">
                        {topic}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Recently solved 3+ questions from this topic.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivation / Quote section */}
              <div className="mt-10 bg-white border-l-4 border-purple-500 p-4 shadow rounded">
                <p className="text-sm italic text-gray-700">
                  “Consistency is more important than intensity. Solve daily, even if just a little.”
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Recommended;
