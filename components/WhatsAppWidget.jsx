"use client";

import { useEffect, useRef, useState } from "react";

function useClickAway(ref, onAway) {
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onAway?.();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onAway?.();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onAway]);
}

function formatPhoneNumber(phone) {
  return String(phone).replace(/[^\d]/g, "");
}

export default function WhatsAppWidget({
  phone1 = "+6281161617181",
  phone2 = "+6281161617180",

  message = "Halo sobat Royal Klinik, ada yang bisa kami bantu?",
  brand = "#25D366",
  label = "WhatsApp",
  iconSrc = "/icons/sosmed/whatsApp.svg", // ambil dari /public
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  useClickAway(panelRef, () => setOpen(false));

  const phoneDigits1 = formatPhoneNumber(phone1);
  const phoneDigits2 = formatPhoneNumber(phone2);

  const waLink1 = `https://wa.me/${phoneDigits1}?text=${encodeURIComponent(
    message
  )}`;

  const waLink2 = `https://wa.me/${phoneDigits2}?text=${encodeURIComponent(
    message
  )}`;

  const openChat = () => window.open(waLink1, "_blank", "noopener,noreferrer");
  const openChat2 = () => window.open(waLink2, "_blank", "noopener,noreferrer");

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className="fixed right-4 bottom-[92px] z-[1000] w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white font-semibold"
            style={{ backgroundColor: brand }}
          >
            <div className="flex items-center gap-2">
              <img src={iconSrc} alt="" className="h-5 w-5" />
              <span>{label}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-content-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="relative rounded-2xl bg-white ring-1 ring-slate-200 shadow px-4 py-3 text-slate-800 text-sm">
              Halo sobat Royal Klinik,
              <br />
              ada yang bisa kami bantu?
              <span
                className="absolute -left-2 top-4 h-0 w-0 border-y-8 border-y-transparent border-r-8"
                style={{ borderRightColor: "#ffffff" }}
              />
            </div>

            <div className="mt-4 flex flex-row justify-evenly gap-3">
              <button
                onClick={openChat}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white font-semibold shadow hover:opacity-95 focus:outline-none cursor-pointer"
                style={{ backgroundColor: brand }}
              >
                <img src={iconSrc} alt="" className="h-4 w-4" />
                Admin 1
              </button>
              <button
                onClick={openChat2}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white font-semibold shadow hover:opacity-95 focus:outline-none cursor-pointer"
                style={{ backgroundColor: brand }}
              >
                <img src={iconSrc} alt="" className="h-4 w-4" />
                Admin 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open WhatsApp chat"
        className="fixed right-4 bottom-4 z-[1000] h-14 w-14 rounded-full shadow-xl ring-1 ring-black/10 grid place-content-center transition hover:scale-105 focus:outline-none"
        style={{ backgroundColor: brand }}
      >
        <img src={iconSrc} alt="" className="h-7 w-7" />
      </button>
    </>
  );
}
