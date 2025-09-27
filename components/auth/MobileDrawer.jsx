"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";

const BRAND = "#4698E3";
const DURATION = 220; // ms, samain dengan Tailwind duration-200

export default function MobileDrawer({ open, onClose, role }) {
  // kontrol mount/unmount + animasi keluar
  const [render, setRender] = React.useState(open);
  const [closing, setClosing] = React.useState(false);
  const [entered, setEntered] = React.useState(false); // untuk animasi masuk

  React.useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      // next-tick biar transition jalan
      requestAnimationFrame(() => setEntered(true));
    } else if (render) {
      setEntered(false);
      setClosing(true);
      const t = setTimeout(() => {
        setRender(false);
        setClosing(false);
      }, DURATION);
      return () => clearTimeout(t);
    }
  }, [open, render]);

  // Esc to close
  React.useEffect(() => {
    if (!render) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [render, onClose]);

  if (!render) return null;

  return createPortal(
    <>
      {/* Backdrop: fade in/out */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-200 ${
          entered && !closing ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: slide from left */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-[9999] h-screen w-[88%] max-w-[360px]
          bg-white shadow-xl ring-1 ring-slate-200 p-4
          flex flex-col overflow-y-auto overscroll-contain
          transform transition-transform duration-200
          ${entered && !closing ? "translate-x-0" : "-translate-x-full"}`}
        style={{ "--tw-ring-color": BRAND }}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">Menu</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 ring-1 ring-slate-200 hover:bg-slate-50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 h-px bg-slate-100" />

        {/* Links */}
        <nav className="flex flex-col">
          <details className="group">
            <summary className="list-none cursor-pointer select-none px-2 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between">
              <span>Articles</span>
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-1 ml-2 flex flex-col">
              <Link
                href="/dashboard/articles/categories"
                onClick={onClose}
                className="px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Manage Category Articles
              </Link>
              <Link
                href="/dashboard/articles"
                onClick={onClose}
                className="px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Manage Articles
              </Link>
            </div>
          </details>

          <Link
            href="/dashboard/csr"
            onClick={onClose}
            className="px-2 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            CSR
          </Link>

          {role === "superadmin" && (
            <>
              <Link
                href="/dashboard/users"
                onClick={onClose}
                className="px-2 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Manage User
              </Link>
              <Link
                href="/dashboard/activity-logs"
                onClick={onClose}
                className="px-2 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Activity Logs
              </Link>
            </>
          )}
        </nav>

        <div className="mt-auto pt-3 pb-[env(safe-area-inset-bottom)] text-[11px] text-slate-400">
          <span style={{ color: BRAND }}>Admin</span> • responsive & tidy
        </div>
      </aside>
    </>,
    document.body
  );
}
