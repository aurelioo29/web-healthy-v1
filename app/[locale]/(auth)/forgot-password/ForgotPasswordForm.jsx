"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Toastify from "toastify-js";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("/auth/forgot-password-code", { email });

      Toastify({
        text: res.data.message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#4BB543",
      }).showToast();

      setTimeout(() => {
        router.push(`/reset-password?email=${email}`);
      }, 1000);
    } catch (err) {
      Toastify({
        text: err?.response?.data?.message || "Failed to request OTP",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF4136",
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
          required
        />
        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#4698E3] text-white rounded-md hover:bg-[#3583ca] transition-colors"
      >
        {loading ? "Sending OTP..." : "GET OTP"}
      </button>
    </form>
  );
}
