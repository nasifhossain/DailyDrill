import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Navbar from "../components/Navbar";

const BACKEND_URI = "http://localhost:3000";

function MyAccount() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (username !== localStorage.getItem("username")) {
      navigate("/login");
      return;
    }

    axios
      .get(`${BACKEND_URI}/user/${username}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`},
      })
      .then((res) => {
        const user = res.data.userDetails;
        console.log(res);
        
        Object.keys(user).forEach((key) => {if(key)setValue(key, user[key])});
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load user data.");
        console.log(err);
        
      })
      .finally(() => setLoading(false));
  }, [username, navigate, setValue]);

  const onSubmit = (data) => {
    setError("");
    setSuccess("");
    axios
      .put(`${BACKEND_URI}/user/update`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setSuccess("Account updated successfully.");
        setTimeout(() => navigate("/"), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Update failed.");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">My Account</h2>

        {error && <p className="text-sm text-red-600 text-center mb-2">{error}</p>}
        {success && <p className="text-sm text-green-600 text-center mb-2">{success}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register("name")}
              className="w-full border px-4 py-2 rounded-md"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              {...register("username")}
              disabled
              className="w-full border bg-gray-100 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border px-4 py-2 rounded-md"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Codeforces Handle</label>
            <input
              {...register("codeforces")}
              className="w-full border px-4 py-2 rounded-md"
              placeholder="e.g., tourist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password (for update)</label>
            <input
              {...register("password")}
              type="password"
              className="w-full border px-4 py-2 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
          >
            Update Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default MyAccount;
