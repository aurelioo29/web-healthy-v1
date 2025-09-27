"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toastify from "toastify-js";
import axios from "@/lib/axios";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fieldErr, setFieldErr] = useState({});

  const toast = (text, ok = true) =>
    Toastify({
      text,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: ok ? "#4BB543" : "#FF4136",
    }).showToast();

  const parseApiError = (error) => {
    const res = error?.response?.data;
    if (!res) return error?.message || "Registrasi gagal";
    const { message, errors } = res;

    if (errors) {
      // errors bisa: string | array | object
      if (typeof errors === "string") return errors;
      if (Array.isArray(errors))
        return errors
          .map((e) => e?.msg || e?.message || e)
          .filter(Boolean)
          .join("\n");
      if (typeof errors === "object") return Object.values(errors).join("\n");
    }
    return message || "Registrasi gagal";
  };

  // hapus error per-field saat mengetik
  const clearFieldErr = (name) =>
    setFieldErr((prev) => {
      if (!prev?.[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      toast("Harap setujui terms and conditions", false);
      return;
    }
    if (password !== confirmPassword) {
      setFieldErr((p) => ({
        ...p,
        confirmPassword: "Konfirmasi password tidak sama",
      }));
      toast("Password dan konfirmasi tidak sama", false);
      return;
    }

    try {
      setLoading(true);
      setFieldErr({});

      const { data } = await axios.post("/auth/signup", {
        username,
        email,
        password,
        confirmPassword,
      });

      document.cookie = `pendingEmail=${encodeURIComponent(
        email
      )}; Max-Age=600; Path=/; SameSite=Lax`;
      // localStorage.setItem("pendingEmail", email);
      toast(data?.message || "Registrasi berhasil! Kode verifikasi dikirim.");
      router.push(`/verify-account?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (
        apiErrors &&
        typeof apiErrors === "object" &&
        !Array.isArray(apiErrors)
      ) {
        setFieldErr(apiErrors);
      }
      toast(parseApiError(err), false);
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 outline-none";
  const okBorder = "border-[#4698E3] focus:ring-[#4698E3]";
  const errBorder = "border-[#4698E3] focus:ring-[#4698E3]";

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-4xl font-extrabold text-gray-900">
        Create your account
      </h1>
      <p className="mt-2 text-gray-600">Unlock all Features!</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {/* Username */}
        <div className="relative">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearFieldErr("username");
            }}
            placeholder="Username"
            required
            className={`${baseInput} ${
              fieldErr.username ? errBorder : okBorder
            }`}
          />
          <User className="absolute left-3 top-3.5 h-5 w-5 text-[#4698E3]" />
          {fieldErr.username && (
            <p className="mt-1 text-xs text-rose-600">{fieldErr.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldErr("email");
            }}
            placeholder="Email"
            required
            className={`${baseInput} ${fieldErr.email ? errBorder : okBorder}`}
          />
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#4698E3]" />
          {fieldErr.email && (
            <p className="mt-1 text-xs text-rose-600">{fieldErr.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldErr("password");
            }}
            placeholder="Password"
            required
            className={`${baseInput} pr-11 ${
              fieldErr.password ? errBorder : okBorder
            }`}
          />
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#4698E3]" />
          {showPass ? (
            <EyeOff
              className="absolute right-3 top-3.5 h-5 w-5 text-[#4698E3] cursor-pointer"
              onClick={() => setShowPass(false)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-3.5 h-5 w-5 text-[#4698E3] cursor-pointer"
              onClick={() => setShowPass(true)}
            />
          )}
          {fieldErr.password && (
            <p className="mt-1 text-xs text-rose-600">{fieldErr.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldErr("confirmPassword");
            }}
            placeholder="Confirm Password"
            required
            className={`${baseInput} pr-11 ${
              fieldErr.confirmPassword ? errBorder : okBorder
            }`}
          />
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#4698E3]" />
          {showConfirm ? (
            <EyeOff
              className="absolute right-3 top-3.5 h-5 w-5 text-[#4698E3] cursor-pointer"
              onClick={() => setShowConfirm(false)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-3.5 h-5 w-5 text-[#4698E3] cursor-pointer"
              onClick={() => setShowConfirm(true)}
            />
          )}
          {fieldErr.confirmPassword && (
            <p className="mt-1 text-xs text-rose-600">
              {fieldErr.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <label className="mt-2 flex items-center gap-1 select-none text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="accent-[#4698E3]"
          />
          Accept{" "}
          <a href="#" className="text-[#4698E3] hover:underline">
            terms and conditions
          </a>
        </label>

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#4698E3] hover:bg-[#4698E3] text-white font-semibold transition cursor-pointer"
        >
          {loading ? "Creating..." : "LOG IN"}
        </button>

        <p className="text-center text-gray-600 mt-2">
          You have account?{" "}
          <Link
            href="/login"
            className="text-[#4698E3] font-semibold hover:underline"
          >
            Login now
          </Link>
        </p>
      </form>
    </div>
  );
}
