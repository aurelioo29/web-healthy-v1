"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import NavbarUser from "./NavbarUser";
import axios from "@/lib/axios";
import MobileDrawer from "./MobileDrawer";

const BRAND = "#4698E3";

function useClickAway(ref, onAway) {
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onAway?.();
    };
    const onEsc = (e) => e.key === "Escape" && onAway?.();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onAway]);
}

/** Dropdown Articles untuk desktop */
function ArticlesMenu() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useClickAway(boxRef, () => setOpen(false));

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 hover:text-slate-900 text-slate-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Articles
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50"
        >
          <div className="py-1">
            <Link
              href="/dashboard/articles/categories"
              className="block px-4 py-2.5 text-sm hover:bg-slate-50"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Manage Category Articles
            </Link>
            <Link
              href="/dashboard/articles"
              className="block px-4 py-2.5 text-sm hover:bg-slate-50"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Manage Articles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tombol hamburger → animasi morph ke X */
function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="md:hidden relative h-10 w-10 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
    >
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      <div className="absolute inset-0 grid place-content-center">
        {/* bar 1 */}
        <span
          className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-200 ${
            open ? "translate-y-1.5 rotate-45" : "-translate-y-1.5"
          }`}
        />
        {/* bar 2 */}
        <span
          className={`block h-0.5 w-5 bg-slate-700 transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* bar 3 */}
        <span
          className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-200 ${
            open ? "-translate-y-1.5 -rotate-45" : "translate-y-1.5"
          }`}
        />
      </div>
    </button>
  );
}

export default function NavbarAdmin() {
  const [role, setRole] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRole(res.data.user.role))
      .catch(() => setRole(""));
  }, []);

  // Lock scroll saat drawer terbuka
  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-[200] w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6">
          {/* Left: Burger + Logo */}
          <div className="flex items-center gap-3">
            <HamburgerButton
              open={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            />
            <Link href="/dashboard" className="inline-flex items-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={140}
                height={40}
                priority
                className="h-8 w-auto object-contain md:h-9"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <ArticlesMenu />
            <Link
              href="/dashboard/csr"
              className="text-slate-700 hover:text-slate-900"
            >
              CSR
            </Link>

            {role === "superadmin" && (
              <>
                <Link
                  href="/dashboard/users"
                  className="text-slate-700 hover:text-slate-900"
                >
                  Manage User
                </Link>
                <Link
                  href="/dashboard/activity-logs"
                  className="text-slate-700 hover:text-slate-900"
                >
                  Activity Logs
                </Link>
              </>
            )}

            <NavbarUser />
          </nav>

          {/* Right (mobile) */}
          <div className="md:hidden">
            <NavbarUser />
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
      />
    </>
  );
}
