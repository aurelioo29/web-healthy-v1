"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "@/lib/axios";
import NavbarUser from "./NavbarUser";
import MobileDrawer from "./MobileDrawer";
import { usePathname } from "next/navigation";

const BRAND = "#4698E3";

/** Hooks */
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

/** Reusable Dropdown */
function Dropdown({ label, items = [], activePath }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useClickAway(boxRef, () => setOpen(false));

  // Active state kalau ada child yang match
  const isActive = items.some((it) => activePath.startsWith(it.href));

  if (!items?.length) {
    return <span className="text-slate-700">{label}</span>;
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 cursor-pointer ${
          isActive
            ? "text-slate-900 font-medium"
            : "text-slate-700 hover:text-slate-900"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setOpen(true);
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {label}
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
            {items.map((it) => {
              const childActive = activePath.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`block px-4 py-2.5 text-sm hover:bg-slate-50 ${
                    childActive
                      ? "text-slate-900 font-medium"
                      : "text-slate-700"
                  }`}
                  role="menuitem"
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Data-driven nav */
const NAV_ITEMS = [
  {
    type: "dropdown",
    label: "Slideshow",
    items: [
      // { label: "Manage Testimoni", href: "/dashboard/testimoni" },
      { label: "Manage Event & Promo", href: "/dashboard/event-promo" },
      { label: "Manage CSR", href: "/dashboard/csr" },
      { label: "Manage Layanan Klinik", href: "/dashboard/layanan-klinik" },
      { label: "Manage Lokasi Klinik", href: "/dashboard/lokasi-klinik" },
      { label: "Manage Corporate Health", href: "/dashboard/corporate-health" },
      // { label: "Manage Dokter", href: "/dashboard/dokter" },
    ],
  },
  {
    type: "dropdown",
    label: "About",
    items: [
      { label: "About (Overview)", href: "/dashboard/about" },
      { label: "About Gallery", href: "/dashboard/about/gallery" },
      { label: "About Certificates", href: "/dashboard/about/sertifikat" },
      { label: "About President", href: "/dashboard/about/president" },
      // { label: "About Core Values", href: "/dashboard/about/core-values" },
    ],
  },
  {
    type: "dropdown",
    label: "Articles",
    items: [
      {
        label: "Manage Category Articles",
        href: "/dashboard/articles/categories",
      },
      { label: "Manage Articles", href: "/dashboard/articles" },
    ],
  },
  {
    type: "dropdown",
    label: "Lab Tests",
    items: [
      {
        label: "Manage Lab Test Categories",
        href: "/dashboard/lab-tests/categories",
      },
      { label: "Manage Lab Tests", href: "/dashboard/lab-tests" },
    ],
  },
  {
    type: "dropdown",
    label: "Investor",
    items: [
      {
        label: "Manage Investor Categories",
        href: "/dashboard/investor/categories",
      },
      { label: "Manage Investors", href: "/dashboard/investor" },
    ],
  },
  {
    type: "dropdown",
    label: "E-Catalog",
    items: [
      {
        label: "Manage E-Catalog Categories",
        href: "/dashboard/e-catalog/categories",
      },
      { label: "Manage E-Catalog", href: "/dashboard/e-catalog" },
    ],
  },
];

const SUPERADMIN_ITEMS = {
  type: "dropdown",
  label: "Account Panel",
  items: [
    { label: "Manage Users", href: "/dashboard/users" },
    { label: "Activity Logs", href: "/dashboard/activity-logs" },
  ],
};

function HamburgerButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="md:hidden relative h-10 w-10 rounded-md ring-1 ring-slate-200 hover:bg-slate-50"
    >
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      <div className="absolute inset-0 grid place-content-center">
        <span
          className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-200 ${
            open ? "translate-y-1.5 rotate-45" : "-translate-y-1.5"
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-slate-700 transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
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
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRole(res.data.user.role))
      .catch(() => setRole(""));
  }, []);

  // Lock scroll saat drawer buka
  useEffect(() => {
    const lock = () => {
      document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    };
    lock();
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const desktopItems = [
    ...NAV_ITEMS,
    ...(role === "superadmin" ? [SUPERADMIN_ITEMS] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-[200] w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto flex h-16 md:h-20 lg:h-24 items-center justify-between px-4 sm:px-6">
          {/* Left: Burger + Logo */}
          <div className="flex items-center gap-3">
            <HamburgerButton
              open={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            />

            {/* Brand group: logo + text */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 md:gap-3"
            >
              <Image
                src="/images/home-pages/logo.svg"
                alt="Royal Klinik logo"
                width={200}
                height={80}
                priority
                // Logo makin besar sesuai breakpoint (tanpa mengecil di desktop)
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
                sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 200px"
              />
              <span
                // Sesuaikan tinggi teks dengan tinggi logo
                className="text-[#001A9E] font-semibold leading-none tracking-tight
                 text-lg sm:text-xl md:text-2xl lg:text-3xl"
              >
                Royal Klinik
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {desktopItems.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname.startsWith(item.href)
                      ? "text-slate-900 font-medium"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <Dropdown
                  key={item.label}
                  label={item.label}
                  items={item.items}
                  activePath={pathname}
                />
              )
            )}
            <NavbarUser />
          </nav>

          {/* Right (mobile) */}
          <div className="md:hidden">
            <NavbarUser />
          </div>
        </div>
      </header>

      {/* Mobile Drawer pakai data yang sama */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={role}
        navItems={desktopItems}
        brandColor={BRAND}
      />
    </>
  );
}
