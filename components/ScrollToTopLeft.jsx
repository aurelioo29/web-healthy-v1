"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopLeft({
  offset = 300,
  ariaLabel = "Scroll to top",
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let rAF = null;

    const onScroll = () => {
      if (rAF) return;
      rAF = window.requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop;
        setShow(y > offset);
        rAF = null;
      });
    };

    onScroll(); // cek posisi saat mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  const onClick = () => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <div
      className={`fixed left-4 md:left-6 bottom-5 z-[60] pointer-events-none transition cursor-pointer ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full shadow-md ring-1 ring-slate-200 bg-[#4698E3] hover:bg-slate-50 text-white hover:text-slate-900 transition cursor-pointer"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
