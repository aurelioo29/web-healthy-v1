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

  const toast = (text, ok = true) =>
    Toastify({
      text,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: ok ? "#4BB543" : "#FF4136",
      close: true,
    }).showToast();

  // satukan semua format error dari BE
  const getErrorText = (err) => {
    const res = err?.response?.data;
    if (!res) return err?.message || "Failed to request OTP";

    const { errors, message, msg, error } = res;
    if (errors) {
      if (typeof errors === "string") return errors;
      if (Array.isArray(errors)) {
        const lines = errors
          .map((e) => e?.msg || e?.message || e)
          .filter(Boolean);
        if (lines.length) return lines.join("\n");
      }
      if (typeof errors === "object") {
        const lines = Object.values(errors)
          .map((v) =>
            typeof v === "string"
              ? v
              : v?.msg || v?.message || JSON.stringify(v)
          )
          .filter(Boolean);
        if (lines.length) return lines.join("\n");
      }
    }
    return message || msg || error || "Failed to request OTP";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("/auth/forgot-password-code", { email });

      // proteksi step berikutnya dengan cookie simple
      document.cookie = `resetEmail=${encodeURIComponent(
        email
      )}; Max-Age=900; Path=/; SameSite=Lax`;

      toast(res?.data?.message || "OTP sent to your email", true);

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 600);
    } catch (err) {
      toast(getErrorText(err), false);
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
