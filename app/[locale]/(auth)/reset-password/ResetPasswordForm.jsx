"use client";

import { useEffect, useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Toastify from "toastify-js";

export default function ResetPasswordForm({ initialEmail }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || initialEmail || "";
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const toast = (text, ok = true) =>
    Toastify({
      text,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: ok ? "#4BB543" : "#FF4136",
      close: true,
    }).showToast();

  const getErrorText = (err) => {
    const res = err?.response?.data;
    if (!res) return err?.message || "Something went wrong";

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
    return message || msg || error || "Something went wrong";
  };

  // helper cookie
  const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  };

  // Proteksi URL: harus punya ?email=... dan cocok dengan cookie resetEmail
  useEffect(() => {
    const guard = () => {
      if (!email) {
        toast("Link is invalid or expired", false);
        router.replace("/forgot-password");
        return;
      }
      const fromCookie = getCookie("resetEmail");
      if (!fromCookie || fromCookie !== email) {
        toast("You need to request OTP again", false);
        router.replace("/forgot-password");
      }
    };
    guard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // timer untuk tombol resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      return toast("Invalid code format (6 digits)", false);
    }
    if (password !== confirmPassword) {
      return toast("Passwords do not match", false);
    }

    try {
      setLoading(true);

      const res = await axios.post("/auth/recover-password", {
        email,
        code,
        password,
        confirmPassword,
      });

      // hapus cookie proteksi setelah berhasil
      document.cookie = "resetEmail=; Max-Age=0; Path=/; SameSite=Lax";

      toast(res?.data?.message || "Password updated", true);
      setTimeout(() => router.push("/login"), 700);
    } catch (err) {
      toast(getErrorText(err), false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    try {
      setResending(true);
      const res = await axios.post("/auth/forgot-password-code", { email });
      toast(res?.data?.message || "OTP resent", true);
      setCooldown(300); // 5 menit
    } catch (err) {
      toast(getErrorText(err), false);
    } finally {
      setResending(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleReset}>
      <div className="relative">
        <input
          type="text"
          placeholder="OTP Code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
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
