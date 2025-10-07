"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SearchArticleBar from "./SearchArticleBar";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const [openIdx, setOpenIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathNoLocale =
    (pathname || "/").replace(/^\/(id|en)(?=\/|$)/, "") || "/";

  // helper: bikin regex cepat
  const re = (p) => new RegExp(`^${p}(\\/|$)`, "i");

  // NEW: toggle untuk flyout search (desktop)
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchAutoFocus, setMobileSearchAutoFocus] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!navRef.current?.contains(e.target)) setOpenIdx(null);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpenIdx(null);
        setMobileOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };
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
    { label: t("about"), href: "/tentang-kami", match: [re("/tentang-kami")] },
    {
      label: t("products"),
      match: [
        // re("/tes-laboratorium"),
        // re("/genomik"),
        // re("/homecare-service"),
        // re("/panel-pemeriksaan"),
        // re("/layanan-klinik"),
        // re("/corporate-health-service"),
        // re("/e-catalog"),
      ],
      dropdown: {
        columns: [
          {
            title: t("testTypes"),
            items: [
              { label: t("labTest"), href: "/tes-laboratorium" },
              { label: t("consult"), href: "/konsultasi-dokter" },
              { label: t("clinic"), href: "/layanan-klinik" },
              { label: t("corporate"), href: "/corporate-health-service" },
              { label: t("ecatalog"), href: "/e-catalog" },
            ],
          },
          // {
          //   title: t("services"),
          //   items: [
          //     { label: t("labTest"), href: "/tes-laboratorium" },
          //     { label: t("genomic"), href: "/genomik" },
          //     { label: t("homecare"), href: "/homecare-service" },
          //     { label: t("panel"), href: "/panel-pemeriksaan" },
          //   ],
          // },
        ],
      },
    },
    {
      label: t("insight"),
      match: [
        re("/insight"),
        re("/keberlanjutan"),
        re("/artikel-kesehatan"),
        // re("/manajemen-laboratorium"),
      ],
      dropdownItems: [
        { label: t("csr"), href: "/keberlanjutan" },
        { label: t("artikel"), href: "/artikel-kesehatan" },
        // { label: t("manajemen"), href: "/manajemen-laboratorium" },
      ],
    },

    {
      label: t("investor"),
      href: "/hubungan-investor",
      match: [re("/hubungan-investor")],
    },
    {
      label: t("locations"),
      href: "/lokasi-klinik",
      match: [re("/lokasi-klinik")],
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] text-white rounded-none md:rounded-2xl mx-auto max-w-7xl md:mt-3">
      {/* ===== Mobile drawer: FULL, dari KIRI ===== */}
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
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              className="fixed inset-y-0 left-0 z-[60] h-full w-full max-w-[88%] sm:max-w-[380px] bg-white p-4 text-[#4698E3] md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm tracking-wider font-semibold">
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
                          className="block rounded px-2 py-2 text-[15px] text-[#0f172a] hover:bg-[#4698E3] hover:text-white"
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

      {/* ===== Mobile bar ===== */}
      <div className="mx-auto max-w-7xl px-4 py-4 md:hidden relative">
        <div className="grid grid-cols-3 items-center">
          {/* kiri: hamburger */}
          <div className="flex">
            <button
              className="rounded p-2 hover:bg-white/10 cursor-pointer"
              aria-label="Open menu"
              onClick={() => {
                setMobileOpen(true);
                setMobileSearchOpen(false); // tutup flyout kalau drawer dibuka
              }}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* tengah: logo */}
          <div className="flex justify-center">
            <Link href={"/"} aria-label="Home">
              <img
                src="/images/home-pages/logo.svg"
                alt="logo"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* kanan: search + locale */}
          <div className="flex justify-end items-center gap-2">
            <button
              aria-label="Search"
              className="rounded p-2 hover:bg-white/10 cursor-pointer"
              onClick={() => {
                setMobileSearchOpen((v) => !v);
                setMobileSearchAutoFocus(true);
              }}
            >
              <Search className="h-6 w-6" />
            </button>
            <LocaleSwitcher />
          </div>
        </div>

        {/* 🔽 Flyout search mobile */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <>
              {/* panel input */}
              <motion.div
                key="m-search"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full mt-2 z-[70]"
              >
                <SearchArticleBar
                  autoFocus={mobileSearchAutoFocus}
                  onAfterSubmit={() => {
                    setMobileSearchOpen(false);
                    setMobileSearchAutoFocus(false);
                  }}
                />
              </motion.div>

              {/* overlay supaya klik luar menutup */}
              <motion.div
                key="m-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60]"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setMobileSearchAutoFocus(false);
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Desktop bar ===== */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-10 py-3 md:flex">
        <Link href={"/"} aria-label="Home">
          <img
            src="/images/home-pages/logo.svg"
            alt="logo"
            className="h-20 w-auto"
          />
        </Link>

        {/* Nav utama */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-10 md:flex"
        >
          {NAV.map((item, i) => {
            const hasDrop = !!item.dropdown || !!item.dropdownItems;
            const active = Array.isArray(item.match)
              ? item.match.some((rx) => rx.test(pathNoLocale))
              : false;

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
                  onClick={(e) => hasDrop && e.preventDefault()}
                  aria-haspopup={hasDrop ? "menu" : undefined}
                  aria-expanded={openIdx === i}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative flex items-center gap-1 rounded px-2 py-1.5 text-md font-medium hover:font-semibold hover:text-teal-100",
                    active ? "text-teal-100" : "",
                    // garis bawah tipis di tengah (sesuai screenshot)
                    active
                      ? "after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[3px] after:w-11/12 after:rounded after:bg-[#BFEFEA] after:content-['']"
                      : "",
                  ].join(" ")}
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

                {openIdx === i && hasDrop && (
                  <div
                    onMouseEnter={() => setOpenIdx(i)}
                    onMouseLeave={() => setOpenIdx(null)}
                  >
                    {item.dropdown ? (
                      <ProductsMega t={t} locale={locale} />
                    ) : (
                      <SimpleMenu items={item.dropdownItems} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex relative">
          <button
            aria-label="Search"
            className="p-2 hover:bg-white/10 rounded-full cursor-pointer"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-7 w-7" />
          </button>
          <LocaleSwitcher />

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="search-flyout"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-[320px] sm:w-[380px]"
              >
                {/* Tidak ada tombol "Search", cukup ENTER */}
                <SearchArticleBar
                  autoFocus
                  onAfterSubmit={() => setSearchOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MobileAccordion({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [openJenis, setOpenJenis] = useState(false);
  const panelId = useId();
  const reduce = useReducedMotion();
  const t = useTranslations("nav");

  const hasColumns =
    Array.isArray(item.dropdown?.columns) && item.dropdown.columns.length > 0;
  const cols = item.dropdown?.columns ?? [];
  // Cari pakai i18n (aman untuk en/id)
  const colTestTypes = cols.find((c) => c.title === t("testTypes"));
  const colServices = cols.find((c) => c.title === t("services"));

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
      {/* Bar utama: Products & Services / Insight */}
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
              <>
                {/* Seksi collapsible untuk Services (isi: Lab Test, Genomics, Homecare, Panel) */}
                {!!colServices && (
                  <>
                    <button
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-[15px] hover:bg-[#4698E3]/10 hover:text-black cursor-pointer"
                      onClick={() => setOpenJenis((v) => !v)}
                      aria-expanded={openJenis}
                    >
                      <span>{colServices.title}</span>
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
                          {(colServices.items ?? []).map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50 hover:text-black"
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

                {/* Item lain dari Test Types (Doctor Consultation, Clinic, Corporate, E-Catalog) */}
                <ul className="mb-2 space-y-1">
                  {(colTestTypes?.items ?? []).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50 hover:text-black"
                        onClick={onNavigate}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              // Simple dropdown (untuk Insight)
              <ul className="mb-2 space-y-1">
                {(item.dropdownItems || []).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded px-3 py-2 text-sm hover:bg-[#4698E3]/50 hover:text-black"
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
    // {
    //   key: "jenis",
    //   label: t("testTypes"),
    //   children: [
    //     { label: t("labTest"), href: "/tes-laboratorium" },
    //     { label: t("genomic"), href: "/genomik" },
    //     { label: t("homecare"), href: "/homecare-service" },
    //     { label: t("panel"), href: "/panel-pemeriksaan" },
    //   ],
    // },
    { key: "labTest", label: t("labTest"), href: "/tes-laboratorium" },
    { key: "consult", label: t("consult"), href: "/konsultasi-dokter" },
    { key: "clinic", label: t("clinic"), href: "/layanan-klinik" },
    {
      key: "corporate",
      label: t("corporate"),
      href: "/corporate-health-service",
    },
    { key: "ecatalog", label: t("ecatalog"), href: "/e-catalog" },
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
