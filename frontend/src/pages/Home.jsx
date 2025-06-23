import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Flame, Star, Target, TrendingUp, Users } from "lucide-react";
import axios from "axios";

// Feature card component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition">
    <div className="mb-4">{icon}</div>
    <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const Home = () => {
  const fallbackProblems = [
    { id: 1, title: "Two Sum", difficulty: "Easy" },
    { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
    { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard" },
  ];

  const [recommendedProblems, setRecommendedProblems] = useState(fallbackProblems);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("http://localhost:3000/solved/recommend", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const recommended = res.data.recommended.slice(0, 3).map((q, index) => ({
          id: index + 1,
          title: q.questionName,
          difficulty: q.difficulty,
        }));

        setRecommendedProblems(recommended);
      } catch (err) {
        console.error("Failed to fetch recommended problems:", err);
        setRecommendedProblems(fallbackProblems); // fallback on error
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col">
      <Navbar />

      {/* Banner */}
      <section className="w-full bg-indigo-600 text-white py-12 px-6 text-center shadow-md">
        <h1 className="text-4xl font-bold mb-2">Welcome to the DSA Portal</h1>
        <p className="text-lg">Sharpen your skills, track progress, and crack coding interviews with ease.</p>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 space-y-12">
        {/* Recommended Problems */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Recommended for You
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedProblems.map((prob) => (
              <div
                key={prob.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border"
              >
                <h3 className="font-medium text-gray-800">{prob.title}</h3>
                <p
                  className={`text-sm mt-1 ${
                    prob.difficulty === "Easy"
                      ? "text-green-500"
                      : prob.difficulty === "Medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {prob.difficulty}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Challenge */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Daily Challenge
          </h2>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                "Find the Longest Palindromic Substring"
              </h3>
              <p className="text-gray-600 mt-2 text-sm">Solve it today to keep your streak alive!</p>
            </div>
            <button className="mt-4 md:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
              Solve Now
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Why Use This Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-indigo-500" />}
              title="Track Your Progress"
              desc="View your solved problems, performance history, and streaks in one place."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-indigo-500" />}
              title="Compete on Leaderboard"
              desc="Compare your stats with peers and climb the ranks every week."
            />
            <FeatureCard
              icon={<Target className="h-6 w-6 text-indigo-500" />}
              title="Skill-Focused Practice"
              desc="Filter problems by skill level and topic to target your weaknesses."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t mt-auto">
        &copy; {new Date().getFullYear()} DSA Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
