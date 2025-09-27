"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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

  useEffect(() => {
    const root = document.documentElement;
    if (mobileOpen) root.classList.add("overflow-hidden");
    else root.classList.remove("overflow-hidden");
    return () => root.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  const NAV = [
    { label: t("about"), href: "/tentang-kami" },
    {
      label: t("products"),
      dropdown: {
        columns: [
          {
            title: t("testTypes"),
            items: [
              { label: t("consult"), href: "/artikel-kesehatan" },
              { label: t("clinic"), href: "/layanan-klinik" },
              { label: t("corporate"), href: "/corporate-health-service" },
              { label: t("ecatalog"), href: "/produk/e-catalog" },
            ],
          },
          {
            title: t("services"),
            items: [
              { label: t("labTest"), href: "/tes-laboratorium" },
              { label: t("genomic"), href: "/genomik" },
              { label: t("homecare"), href: "/homecare-service" },
              { label: t("panel"), href: "/panel-pemeriksaan" },
            ],
          },
        ],
      },
    },
    {
      label: t("insight"),
      href: "/insight",
      dropdownItems: [
        { label: t("csr"), href: "/keberlanjutan" },
        { label: t("artikel"), href: "/artikel-kesehatan" },
        {
          label: t("manajemen"),
          href: "/manajemen-laboratorium",
        },
      ],
    },
    { label: t("investor"), href: "/hubungan-investor" },
    { label: t("locations"), href: "/lokasi-klinik" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#4698E3] text-white rounded-none md:rounded-2xl mx-auto max-w-7xl md:mt-3">
      {/* BAR: Mobile (Menu — Logo — Search) */}
      <div className="mx-auto max-w-7xl px-4 py-4 md:hidden">
        <div className="grid grid-cols-3 items-center">
          {/* Left: Menu */}
          <div className="flex">
            <button
              className="rounded p-2 hover:bg-white/10 cursor-pointer"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Middle: Logo (centered) */}
          <div className="flex justify-center">
            <Link href={"/"} aria-label="Home">
              <img
                src="/images/home-pages/logo.svg"
                alt="logo"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Right: Search */}
          <div className="flex justify-end">
            <button
              aria-label="Search"
              className="rounded p-2 hover:bg-white/10 cursor-pointer"
              onClick={() => alert("Hook your search modal here.")}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* BAR: Desktop (Logo — Nav — Actions) */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-10 py-4 md:flex">
        {/* Logo */}
        <Link href={"/"} aria-label="Home">
          <img
            src="/images/home-pages/logo.svg"
            alt="logo"
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-10 md:flex"
        >
          {NAV.map((item, i) => {
            const hasDrop = !!item.dropdown || !!item.dropdownItems;

            return (
              <div
                key={item.label + i}
                className="relative"
                onMouseEnter={() => hasDrop && setOpenIdx(i)}
                onMouseLeave={() => hasDrop && setOpenIdx(null)}
              >
                <Link
                  href={item.href ?? pathname}
                  locale={locale}
                  className="flex items-center gap-1 rounded px-2 py-1.5 text-md font-medium hover:bg-white/10"
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
                {openIdx === i &&
                  hasDrop &&
                  (item.label === t("products") ? (
                    <ProductsMega
                      t={t}
                      locale={locale}
                      onMouseEnter={() => setOpenIdx(i)}
                      onMouseLeave={() => setOpenIdx(null)}
                    />
                  ) : (
                    <SimpleMenu
                      items={item.dropdownItems}
                      onMouseEnter={() => setOpenIdx(i)}
                      onMouseLeave={() => setOpenIdx(null)}
                    />
                  ))}
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
      </div>

      {/* Mobile drawer: FULL, dari KIRI */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              className="fixed inset-0 z-[60] h-full w-full bg-white p-4 text-[#4698E3] md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm tracking-wider font-semibold text-[#4698E3]">
                  MAIN MENU
                </span>
                <button
                  className="rounded p-2 hover:bg-[#4698E3]/10 cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ul className="space-y-1">
                {NAV.map((item, i) => {
                  const hasDrop = !!item.dropdown || !!item.dropdownItems;
                  return (
                    <li key={i}>
                      {hasDrop ? (
                        <MobileAccordion
                          item={item}
                          onNavigate={() => setMobileOpen(false)}
                        />
                      ) : (
                        <Link
                          href={item.href}
                          className="block rounded px-2 py-2 text-[15px] hover:bg-[#4698E3] hover:text-white"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileAccordion({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [openJenis, setOpenJenis] = useState(false);
  const panelId = useId();
  const reduce = useReducedMotion();

  // === MODE DETECTION
  const hasColumns =
    Array.isArray(item.dropdown?.columns) && item.dropdown.columns.length > 0;
  const simpleItems = item.dropdownItems || [];

  // === (MEGA) Ambil kolom berdasarkan key terjemahan supaya stabil
  const cols = item.dropdown?.columns ?? [];
  const colJenis = cols.find(
    (c) => c.title === /* t("testTypes") */ "Jenis Tes"
  );
  const colLayanan = cols.find(
    (c) => c.title === /* t("services")  */ "Layanan"
  );

  const panelVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: { duration: reduce ? 0 : 0.18 },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: reduce ? 0 : 0.24 },
    },
  };

  return (
    <div>
      {/* Tombol bar utama (Produk & Layanan / Insight) */}
      <button
        className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[15px] hover:bg-[#4698E3] hover:text-white cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{item.label}</span>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          className="inline-flex"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            role="region"
            aria-label={`${item.label} submenu`}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={panelVariants}
            style={{ overflow: "hidden" }}
            className="pl-2"
          >
            {hasColumns ? (
              // ============= MEGA MENU: Produk & Layanan =============
              <>
                {/* baris "Jenis Tes" yang dapat di-expand/collapse */}
                {colJenis && (
                  <>
                    <button
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-[15px] hover:bg-[#4698E3]/10 cursor-pointer"
                      onClick={() => setOpenJenis((v) => !v)}
                      aria-expanded={openJenis}
                    >
                      <span>{colJenis.title}</span>
                      <motion.span
                        initial={false}
                        animate={{ rotate: openJenis ? 180 : 0 }}
                        transition={{ duration: 0.22 }}
                        className="inline-flex"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {openJenis && (
                        <motion.ul
                          className="ml-2 mb-2 space-y-1"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          {(colLayanan?.items ?? []).map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50"
                                onClick={onNavigate}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* item lain (Konsultasi Dokter, Layanan Klinik, dst) */}
                <ul className="mb-2 space-y-1">
                  {(colJenis?.items ?? []).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50"
                        onClick={onNavigate}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              // ============= SIMPLE MENU: Insight (dropdownItems) =============
              <ul className="mb-2 space-y-1">
                {simpleItems.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50"
                      onClick={onNavigate}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductsMega({ t, locale }) {
  const reduce = useReducedMotion();

  const [activeKey, setActiveKey] = useState(null);

  const groups = [
    {
      key: "jenis",
      label: t("testTypes"),
      children: [
        { label: t("labTest"), href: "/tes-laboratorium" },
        { label: t("genomic"), href: "/genomik" },
        { label: t("homecare"), href: "/homecare-service" },
        { label: t("panel"), href: "/panel-pemeriksaan" },
      ],
    },
    { key: "consult", label: t("consult"), href: "/artikel-kesehatan" },
    { key: "clinic", label: t("clinic"), href: "/layanan-klinik" },
    {
      key: "corporate",
      label: t("corporate"),
      href: "/corporate-health-service",
    },
    { key: "ecatalog", label: t("ecatalog"), href: "/produk/e-catalog" },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: 6, transition: { duration: reduce ? 0 : 0.18 } },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.045,
        delayChildren: reduce ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.18, ease: [0.2, 0, 0, 1] },
    },
  };

  const activeGroup = groups.find((g) => g.key === activeKey);
  const twoCol = !!activeGroup?.children;

  return (
    <AnimatePresence>
      <motion.div
        key="products-mega"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={dropdownVariants}
        onMouseLeave={() => setActiveKey(null)}
        className={`absolute left-0 top-full mt-0 rounded-2xl bg-white text-[#0f172a] cursor-pointer shadow-2xl ring-1 ring-black/5 pointer-events-auto z-50
          ${twoCol ? "w-[500px]" : "w-[260px]"}`}
      >
        <div className={`grid ${twoCol ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* Kiri: daftar kategori */}
          <div
            className={`cursor-pointer p-4 ${
              twoCol ? "border-r border-slate-100" : ""
            }`}
          >
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-1"
            >
              {groups.map((g) => (
                <motion.li key={g.key} variants={itemVariants}>
                  {g.children ? (
                    <button
                      onMouseEnter={() => setActiveKey(g.key)}
                      className={`cursor-pointer flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] ${
                        activeKey === g.key
                          ? "bg-[#e6f0fb] text-[#0f172a] font-semibold"
                          : "hover:bg-[#e6f0fb] hover:text-[#0f172a] hover:font-semibold"
                      }`}
                    >
                      <span>{g.label}</span>
                      <span className="text-slate-400">›</span>
                    </button>
                  ) : (
                    <Link
                      href={g.href}
                      locale={locale}
                      onMouseEnter={() => setActiveKey(null)}
                      className="block rounded-lg px-3 py-2 text-[15px] hover:bg-[#e6f0fb] hover:text-[#0f172a] hover:font-semibold"
                    >
                      {g.label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Kanan: hanya render saat "Jenis Tes" di-hover */}
          {twoCol && (
            <div className="p-4">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-2"
              >
                {activeGroup.children.map((c) => (
                  <motion.li key={c.href} variants={itemVariants}>
                    <Link
                      href={c.href}
                      locale={locale}
                      className="block rounded-lg px-3 py-2 text-[15px] hover:bg-[#e6f0fb] hover:text-black hover:font-semibold"
                    >
                      {c.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function SimpleMenu({ items }) {
  const reduce = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: 6, transition: { duration: reduce ? 0 : 0.18 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="simple-menu"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={variants}
        className="absolute left-0 top-full mt-0 min-w-[270px] rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/5 pointer-events-auto z-50"
      >
        <ul className="p-2">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block rounded-lg px-3 py-2 text-[15px] hover:bg-[#e6f0fb] hover:text-black hover:font-semibold"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
