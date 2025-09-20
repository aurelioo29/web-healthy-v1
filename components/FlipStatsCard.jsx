"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function FlipStatsCard({ icon, value, label, cta }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={[
        "group relative cursor-pointer select-none mx-auto",
        "w-full max-w-[350px] h-56", // mobile
        "md:max-w-[320px] md:h-52", // tablet
        "lg:max-w-none lg:h-56", // desktop
      ].join(" ")}
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped((s) => !s)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((s) => !s);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
    >
      <div
        className={[
          "absolute inset-0 rounded-xl bg-[#586064]/60 p-6 text-white shadow-lg",
          "transform-gpu transition-transform duration-1200 [transform-style:preserve-3d]",
          "group-hover:[transform:rotateY(180deg)]",
          flipped ? "[transform:rotateY(180deg)]" : "",
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
            <div className="text-5xl font-semibold">{value}</div>
            <div className="mt-2 text-xl opacity-90">{label}</div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-xl bg-[#4698E3] p-5 text-left [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="grid h-full place-items-center">
            <div className="w-full max-w-screen text-center">
              <h3 className="text-2xl font-semibold">{cta.title}</h3>
              <p className="mt-2 text-sm opacity-90">{cta.desc}</p>

              {/* Tombol full width */}
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
