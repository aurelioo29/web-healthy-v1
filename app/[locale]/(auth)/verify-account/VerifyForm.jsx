// components/VerifyForm.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toastify from "toastify-js";
import axios from "@/lib/axios";

const BRAND = "#4698E3";

export default function VerifyForm() {
  const router = useRouter();
  const q = useSearchParams();

  // email hanya dari URL / localStorage — tidak ada input manual
  const [email, setEmail] = useState(q.get("email") || "");
  useEffect(() => {
    if (!email) {
      try {
        const saved = localStorage.getItem("pendingEmail");
        if (saved) setEmail(saved);
      } catch {}
    }
  }, [email]);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fieldErr, setFieldErr] = useState({});
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const toast = (text, ok = true) =>
    Toastify({
      text,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: ok ? "#4BB543" : "#FF4136",
    }).showToast();

  const parseApiError = (e) => {
    const r = e?.response?.data;
    if (!r) return e?.message || "Permintaan gagal";
    const { message, errors } = r;
    if (errors) {
      if (typeof errors === "string") return errors;
      if (Array.isArray(errors))
        return errors.map((x) => x?.msg || x?.message || x).join("\n");
      if (typeof errors === "object") return Object.values(errors).join("\n");
    }
    return message || "Permintaan gagal";
  };

  const code = useMemo(() => otp.join(""), [otp]);
  const setDigit = (i, v) => {
    const only = v.replace(/\D/g, "");
    setOtp((p) => {
      const n = [...p];
      n[i] = only.slice(-1);
      return n;
    });
  };
  const onKeyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputsRef.current[i - 1]?.focus();
  };
  const onChange = (e, i) => {
    setDigit(i, e.target.value);
    if (/\d/.test(e.target.value) && i < 5) inputsRef.current[i + 1]?.focus();
    setFieldErr((p) => {
      if (!p.code) return p;
      const n = { ...p };
      delete n.code;
      return n;
    });
  };
  const onPaste = (e) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const arr = Array(6)
      .fill("")
      .map((_, i) => txt[i] || "");
    setOtp(arr);
    inputsRef.current[Math.min(txt.length, 5)]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email)
      return toast("Email tidak ditemukan. Silakan daftar ulang.", false);
    if (code.length < 6) {
      setFieldErr({ code: "Masukkan 6 digit kode" });
      return;
    }
    try {
      setLoading(true);
      setFieldErr({});
      await axios.post("/auth/verification", { email, code });
      try {
        document.cookie = "pendingEmail=; Max-Age=0; Path=/; SameSite=Lax";
        localStorage.removeItem("pendingEmail");
      } catch {}
      toast("Akun berhasil diverifikasi!");
      router.push("/login");
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

  const resend = async () => {
    if (!email || timeLeft > 0) return;
    try {
      setResending(true);
      await axios.post("/auth/resend-verification-code", { email });
      toast("Kode verifikasi dikirim ulang");
      setTimeLeft(180); // 3 menit
    } catch (err) {
      const msg = parseApiError(err);
      toast(msg, false);
      if (/3\s*minutes?/i.test(msg)) setTimeLeft(180);
    } finally {
      setResending(false);
    }
  };

  // Jika tidak ada email di URL maupun localStorage
  if (!email) {
    return (
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold text-gray-900">Enter OTP</h1>
        <p className="mt-3 text-slate-600">
          Kami tidak menemukan email untuk verifikasi. Silakan lakukan
          pendaftaran ulang.
        </p>
        <button
          onClick={() => router.push("/register")}
          className="mt-6 rounded-xl px-4 py-3 text-white font-semibold"
          style={{ background: BRAND }}
        >
          Ke Halaman Register
        </button>
      </div>
    );
  }

  const boxBase =
    "h-14 w-14 rounded-xl border text-center text-xl font-semibold outline-none transition";
  const boxOk =
    "border-[#4698E3]/30 focus:border-[#4698E3] focus:ring-2 focus:ring-[#4698E3]/25";
  const boxErr =
    "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-200";

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-4xl font-extrabold text-gray-900">Enter OTP</h1>
      <p className="mt-2 text-gray-600">
        Sent OTP on{" "}
        <span className="font-semibold" style={{ color: BRAND }}>
          {email}
        </span>
      </p>

      <form onSubmit={submit} className="mt-6">
        {/* OTP di tengah */}
        <div
          className="flex items-center justify-center gap-4"
          onPaste={onPaste}
        >
          {otp.map((v, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              inputMode="numeric"
              maxLength={1}
              value={v}
              onKeyDown={(e) => onKeyDown(e, i)}
              onChange={(e) => onChange(e, i)}
              className={`${boxBase} ${fieldErr.code ? boxErr : boxOk}`}
            />
          ))}
        </div>
        {fieldErr.code && (
          <p className="mt-2 text-center text-sm text-rose-600">
            {fieldErr.code}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="mt-8 w-full rounded-xl py-3 text-white font-semibold disabled:opacity-50"
          style={{ background: BRAND }}
        >
          {loading ? "Submitting..." : "SUBMIT"}
        </button>

        <div className="mt-4 text-center">
          {timeLeft > 0 ? (
            <span className="text-sm text-gray-500">
              Kirim ulang dalam{" "}
              <span className="font-semibold" style={{ color: BRAND }}>
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="text-sm font-semibold disabled:opacity-50"
              style={{ color: BRAND }}
            >
              {resending ? "Sending..." : "Resent OTP"}
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        input:focus {
          box-shadow: 0 0 0 2px ${BRAND}22;
        }
      `}</style>
    </div>
  );
}
