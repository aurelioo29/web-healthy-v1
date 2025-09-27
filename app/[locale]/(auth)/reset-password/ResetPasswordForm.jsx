"use client";

import { useEffect, useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Toastify from "toastify-js";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      return showToast("Invalid code format (6 digits)", "error");
    }

    if (password !== confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    try {
      setLoading(true);

      const res = await axios.post("/auth/recover-password", {
        email,
        code,
        password,
        confirmPassword,
      });

      showToast(res.data.message, "success");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      const errorData = err?.response?.data;
      const msg = errorData?.errors
        ? Object.values(errorData.errors).join("\n")
        : errorData?.message || "Something went wrong";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    try {
      setResending(true);
      const res = await axios.post("/auth/forgot-password-code", { email });
      showToast(res.data.message, "success");
      setCooldown(300); // 5 mins
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to resend", "error");
    } finally {
      setResending(false);
    }
  };

  const showToast = (msg, type) => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: type === "error" ? "#FF4136" : "#4BB543",
    }).showToast();
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleReset}>
      <div className="relative">
        <input
          type="text"
          placeholder="OTP Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
          required
        />
        <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="text-sm text-gray-500 flex justify-between items-center">
        <p>Didn’t receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="ml-2 text-[#4698E3] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </button>
      </div>

      <div className="relative">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
          required
        />
        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="relative">
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4698E3] outline-none"
          required
        />
        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-[#4698E3] text-white rounded-md hover:bg-[#3583ca] transition-colors"
      >
        {loading ? "Submitting..." : "SUBMIT"}
      </button>
    </form>
  );
}
