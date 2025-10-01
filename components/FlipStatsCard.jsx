"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ---------------- Count-up hook ---------------- */
function parseTarget(raw) {
  // Ambil angka (hapus pemisah . , spasi); simpan suffix seperti "+"
  const s = String(raw ?? "").trim();
  const suffix = /\+$/.test(s) ? "+" : "";
  // buang semua selain digit
  const digits = (s.match(/\d+/g) || ["0"]).join("");
  const n = Number(digits || 0);
  return { n, suffix };
}

function formatNumberID(n) {
  try {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(rawValue, { duration = 1600, once = true } = {}) {
  const { n: target, suffix } = useMemo(
    () => parseTarget(rawValue),
    [rawValue]
  );
  const [display, setDisplay] = useState("0" + suffix);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started && !(once && done)) {
            setStarted(true);
          }
        });
      },
      { threshold: 0.35 }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [started, done, once]);

  useEffect(() => {
    if (!started) return;

    const start = performance.now();
    const run = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = easeOutCubic(p);
      const current = target * eased;
      setDisplay(formatNumberID(current) + suffix);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(run);
      } else {
        setDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(run);

    return () => cancelAnimationFrame(rafRef.current);
  }, [started, target, suffix, duration]);

  return { ref, display };
}
/* -------------- /Count-up hook ----------------- */

export default function FlipStatsCard({ icon, value, label, cta }) {
  // jalankan count-up ketika kartu terlihat
  const { ref, display } = useCountUp(value, { duration: 1600 });

  return (
    <div
      ref={ref}
      className={[
        "group relative cursor-pointer select-none mx-auto",
        "w-full max-w-[350px] h-56", // mobile
        "md:max-w-[320px] md:h-52", // tablet
        "lg:max-w-none lg:h-56", // desktop
      ].join(" ")}
      style={{ perspective: "1200px" }}
      // flip by hover (klik juga oke di mobile)
      onClick={(e) => e.currentTarget.classList.toggle("is-flipped")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.currentTarget.classList.toggle("is-flipped");
        }
      }}
      aria-pressed={false}
    >
      <div
        className={[
          "absolute inset-0 rounded-xl bg-[#586064]/60 p-6 text-white shadow-lg",
          "transform-gpu transition-transform duration-[1200ms] [transform-style:preserve-3d]",
          "group-hover:[transform:rotateY(180deg)]",
          // support toggle via class is-flipped (mobile)
          "[.is-flipped_&]:[transform:rotateY(180deg)]",
        ].join(" ")}
      >
        {/* FRONT */}
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
          <div className="flex flex-col items-center text-center gap-3">
            {icon ? (
              <img
                src={icon}
                alt=""
                width={45}
                height={35}
                className="mb-2 brightness-0 invert w-8 md:w-9 lg:w-[45px]"
                style={{ height: "auto" }}
              />
            ) : null}

            {/* angka dengan efek 'pop' tiap update */}
            <div
              className="text-5xl font-semibold will-change-transform transition-transform duration-300 group-hover:scale-105"
              key={display} // trik kecil agar ada micro-pop saat selesai
            >
              {display}
            </div>

            <div className="mt-2 text-xl opacity-90">{label}</div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-xl bg-[#4698E3] p-5 text-left [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="grid h-full place-items-center">
            <div className="w-full text-center">
              <h3 className="text-2xl font-semibold">{cta.title}</h3>
              <p className="mt-2 text-sm opacity-90">{cta.desc}</p>

              <div className="mt-4">
                <Link
                  href={cta.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  {cta.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H9M17 7v8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
