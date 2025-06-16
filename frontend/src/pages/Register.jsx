import { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";
import { User, Mail, Lock } from "lucide-react";
import axios from "axios";

const BACKEND_URI = "http://localhost:3000";
const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [errormessage, setErrorMessage] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ message: "", type: "" });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      const res = await axios.post(`${BACKEND_URI}/user/signup`, data);
      if (res.status === 200 || res.status === 201) {
        console.log("Registration successful:", res.data);
        window.location.href = "/login";
      }
    } catch (error) {
      console.log("Error during registration:", error);
      setErrorMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setUsernameStatus({ message: "", type: "" });

    try {
      await axios.post(`${BACKEND_URI}/user/check`, { username });
      setUsernameStatus({ message: "Username is available", type: "success" });
    } catch (err) {
      if (err.response?.status === 400) {
        setUsernameStatus({ message: "Username already exists", type: "error" });
      } else {
        setUsernameStatus({ message: "Error checking username", type: "error" });
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navbar loginPage />
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Form */}
        <div className="flex flex-1 justify-center items-center px-6 py-10 bg-white shadow-inner">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md p-10 rounded-xl shadow-lg space-y-6 border border-gray-200 bg-white"
          >
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Create an Account
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Start your journey with personalized DSA guidance
            </p>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
                <User className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  {...register("username", { required: "Username is required" })}
                  placeholder="Choose a username"
                  onChange={handleUsernameChange}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
              )}
              {usernameStatus.message && (
                <p
                  className={`text-xs mt-1 ${
                    usernameStatus.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {usernameStatus.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
                <Mail className="h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Enter a valid email",
                    },
                  })}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
                <Lock className="h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  placeholder="Create a password"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
                <Lock className="h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === watch("password") || "Passwords do not match",
                  })}
                  placeholder="Repeat your password"
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Server Error */}
            {errormessage && (
              <p className="text-sm text-red-600 text-center font-medium">{errormessage}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Register
            </button>

            {/* Login Link */}
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 hover:underline font-medium">
                Login
              </a>
            </p>
          </form>
        </div>

        {/* Banner */}
        <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-indigo-100 to-blue-100" />
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center text-gray-800">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow">
              Join Us!
            </h1>
            <p className="text-lg font-light max-w-md">
              Track progress, unlock levels, and sharpen your DSA skills in a distraction-free space.
            </p>
            <img
              src="/images/loginimg.png"
              alt="Registration Illustration"
              className="mt-6 w-full max-w-md drop-shadow-xl rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
