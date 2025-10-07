"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({
  logoSrc = "/images/home-pages/logo.svg",
  bg = "#ffffff",
  minDuration = 1000,
}) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [visible]);

  useEffect(() => {
    const start = Date.now();

    const dismiss = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setFade(true);
        setTimeout(() => setVisible(false), 300);
      }, wait);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      const onLoad = () => dismiss();
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, [minDuration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] grid place-items-center transition-opacity duration-300
                  ${fade ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{ background: bg }}
    >
      <div className="flex flex-col items-center">
        {/* Logo */}
        <img
          src={logoSrc}
          alt="Loading..."
          className="h-28 w-auto md:h-72 select-none"
          draggable={false}
        />
      </div>

      {/* keyframes untuk bar */}
      <style jsx>{`
        @keyframes loadbar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(20%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </div>
  );
}
