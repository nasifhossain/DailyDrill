import { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import { User, Lock } from "lucide-react";
import axios from "axios";

const BACKEND_URI = "https://dailydrill-dl2k.onrender.com";

const Login = () => {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError(""); // Clear previous errors
      const res = await axios.post(`${BACKEND_URI}/user/login`, data);
      if (res.status === 200) {
        console.log("Login successful:", res.data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("id", res.data.id);
        window.location.href = "/";
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Login failed. Please try again.";
      setServerError(msg); // Display error
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left - Login Form */}
        <div className="flex flex-1 justify-center items-center px-6 py-10 bg-white shadow-inner">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md bg-white p-10 rounded-xl shadow-xl space-y-6 border border-gray-200"
          >
            <h2 className="text-3xl font-bold text-center text-gray-800">
              DSA Portal Login
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Access your personalized recommendations
            </p>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300 transition duration-200">
                <User className="text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  {...register("username", { required: "Username is required" })}
                  placeholder="Enter username"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300 transition duration-200">
                <Lock className="text-gray-500 h-4 w-4" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 4,
                      message: "Minimum 4 characters required",
                    },
                  })}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="text-sm text-red-600 text-center font-medium">
                {serverError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 shadow-md"
            >
              Login
            </button>

            {/* Register Link */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-indigo-600 hover:underline font-medium">
                Register
              </a>
            </p>
          </form>
        </div>

        {/* Right - Image or Banner */}
        <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100"></div>
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center text-gray-800">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow">
              Welcome Back!
            </h1>
            <p className="text-lg font-light max-w-md text-gray-700">
              Improve your DSA skills with curated recommendations in a clean and focused space.
            </p>
            <img
              src="/images/loginimg.png"
              alt="DSA Illustration"
              className="mt-6 w-full max-w-md drop-shadow-xl rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
