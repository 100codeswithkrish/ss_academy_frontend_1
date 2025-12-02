import React, { useState } from "react";
import SupportDetails from "../components/SupportDetails";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://ss-academy-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );


      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.user.role === "teacher") {
        window.location.href = "/attendance";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-black text-white font-sans overflow-hidden">
      {/* LEFT SIDE — LOGIN SECTION WITH LOGO */}
      <div className="w-full md:w-1/2 flex items-start justify-center pt-10 md:pt-20 p-8">
        <div className="w-full max-w-md">
          {/* Logo above login box */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/class-logo.jpg"
              alt="Class Logo"
              className="w-24 h-24 object-cover rounded-full shadow-2xl border border-gray-700"
            />
          </div>

          {/* Login Box */}
          <div className="bg-[#111] p-10 rounded-2xl shadow-2xl border border-gray-800">
            <div className="text-center mb-8">
              <h1
                className="text-4xl font-bold tracking-wide"
                style={{
                  color: "#FFD700",
                  fontFamily: "'Times New Roman', serif",
                }}
              >
                SS Academy
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                Teacher / Admin Login
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="teacher"
                required
              />

              {/* Password */}
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg mb-4
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-3 rounded-lg text-lg font-semibold
                hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <SupportDetails />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — OWNER PHOTO ONLY */}
      <div className="hidden md:flex flex-col w-1/2 items-start justify-start pt-40 md:pt-50 p-8">
        <div className="w-full flex justify-center">
          {/* Owner Photo — aligned with login box top */}
          <div className="w-[80%] max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
            <img
              src="/assets/owner-photo.jpg"
              alt="Owner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
