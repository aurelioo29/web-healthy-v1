"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const [openIdx, setOpenIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!navRef.current?.contains(e.target)) setOpenIdx(null);
    }

    function onEsc(e) {
      if (e.key === "Escape") {
        setOpenIdx(null);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const NAV = [
    { label: t("about"), href: "/tentang-kami" },
    {
      label: t("products"),
      dropdown: {
        columns: [
          {
            title: t("testTypes"),
            items: [
              { label: t("consult"), href: "/produk/konsultasi-dokter" },
              { label: t("clinic"), href: "/produk/layanan-klinik" },
              { label: t("corporate"), href: "/produk/corporate-health" },
              { label: t("ecatalog"), href: "/produk/e-catalog" },
            ],
          },
          {
            title: t("services"),
            items: [
              { label: t("labTest"), href: "/produk/tes-laboratorium" },
              { label: t("genomic"), href: "/produk/genomik" },
              { label: t("homecare"), href: "/produk/homecare" },
              { label: t("panel"), href: "/produk/panel-pemeriksaan" },
            ],
          },
        ],
      },
    },
    { label: t("insight"), href: "/insight", dropdown: null },
    { label: t("investor"), href: "/hubungan-investor" },
    { label: t("locations"), href: "/lokasi" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#4698E3] text-white rounded-2xl mx-auto max-w-7xl mt-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href={"/"} arial-label="Home">
          <Image
            src="/images/home-pages/logo.webp"
            width={150}
            height={50}
            priority={false}
            alt="logo"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-6 md:flex"
          onMouseLeave={() => setOpenIdx(null)}
        >
          {NAV.map((item, i) => {
            const hasDrop = !!item.dropdown;
            return (
              <div
                key={item.label + i}
                className="relative"
                onMouseEnter={() => hasDrop && setOpenIdx(i)}
              >
                <Link
                  href={item.href ?? pathname}
                  locale={locale}
                  className="flex items-center gap-1 rounded px-2 py-1.5 text-sm font-medium hover:bg-white/10"
                  aria-haspopup={hasDrop ? "menu" : undefined}
                  aria-expanded={openIdx === i}
                >
                  {item.label}
                  {hasDrop && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openIdx === i ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                {/* Mega dropdown */}
                {hasDrop && openIdx === i && (
                  <div className="absolute left-0 top-full mt-2 w-[680px] rounded-2xl bg-white p-6 text-[#0F6A66] shadow-2xl ring-1 ring-black/5">
                    <div className="grid grid-cols-2 gap-8">
                      {item.dropdown.columns.map((col, cIdx) => (
                        <div key={cIdx}>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wide text-teal-900/80">
                              {col.title}
                            </span>
                            {/* subtle caret to mimic “›” */}
                            <span className="text-teal-900/40">›</span>
                          </div>
                          <ul className="space-y-2">
                            {col.items.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block rounded px-2 py-1.5 text-[15px] hover:bg-teal-50 hover:text-teal-900"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Search"
            className="rounded p-2 hover:bg-white/10"
            onClick={() => alert("Hook your search modal here.")}
          >
            <Search className="h-7 w-7" />
          </button>
          <LocaleSwitcher />
        </div>

        {/* Mobile toggles */}
        <button
          className="rounded p-2 hover:bg-white/10 md:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 w-[320px] overflow-y-auto bg-white p-4 text-teal-900 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                className="rounded p-2 hover:bg-teal-50"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="space-y-1">
              {NAV.map((item, i) => (
                <li key={i}>
                  {!item.dropdown ? (
                    <Link
                      href={item.href}
                      className="block rounded px-2 py-2 text-[15px] hover:bg-teal-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <MobileAccordion
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-teal-100 p-3">
              <button
                className="rounded p-2 text-teal-700 hover:bg-teal-50"
                onClick={() => alert("Hook your search modal here.")}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

function MobileAccordion({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[15px] hover:bg-teal-50"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pl-2">
          {item.dropdown.columns.map((col, i) => (
            <div key={i} className="mb-2">
              <div className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-teal-600">
                {col.title}
              </div>
              <ul className="mb-1 space-y-1">
                {col.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded px-3 py-2 text-sm hover:bg-teal-50"
                      onClick={onNavigate}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
