"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import axios from "@/lib/axios";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post("/auth/signin", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.user.token);
      // localStorage.setItem("user", JSON.stringify(res.data.user));

      Toastify({
        text: "Login success!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4BB543",
      }).showToast();

      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (err) {
      Toastify({
        text: err?.response?.data?.message || "Login failed",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF4136",
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">
        Login to your Account
      </h1>
      <p className="mt-2 text-gray-600">
        Welcome back! Select method to log in:
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Username */}
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
            required
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
          />
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {showPassword ? (
            <EyeOff
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {/* Remember me + Forgot */}
        <div className="flex justify-end items-end text-sm text-gray-600">
          {/* <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#4698E3]" />
            Remember me
          </label> */}
          <Link
            href="/forgot-password"
            className="text-[#4698E3] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[#4698E3] text-white rounded-md hover:bg-[#3583ca] transition-colors"
        >
          {loading ? "Logging in..." : "LOG IN"}
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have account?{" "}
          <Link
            href="/register"
            className="text-[#4698E3] hover:underline font-semibold"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
