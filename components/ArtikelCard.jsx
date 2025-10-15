"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

/* ===== Helpers ===== */
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `articles/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const extractExcerpt = (html, max = 180) => {
  const txt = html
    ? html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  return txt.length > max ? `${txt.slice(0, max)}…` : txt;
};

const toYMD = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const uniqBy = (arr, key = "id") => {
  const seen = new Set();
  return arr.filter((x) => {
    const k = x?.[key] ?? x?.slug;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* ===== Skeleton ===== */
function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white animate-pulse h-full flex flex-col">
      <div className="h-56 bg-slate-200" />
      <div className="p-6 space-y-3 flex-1 flex flex-col">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="mt-auto h-10 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

/* ===== Card ===== */
function ArticleCard({ item, t }) {
  const href = `/artikel-kesehatan/${item.slug}`;
  const img = buildImageUrl(item.image, item.imageUrl);
  const title = item.title;
  const excerpt = extractExcerpt(item.content);

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white h-full min-h-[460px] flex flex-col hover:shadow-md transition">
      {img ? (
        <Link href={href} className="block">
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="h-56 w-full object-cover"
          />
        </Link>
      ) : (
        <div className="h-56 w-full grid place-content-center bg-slate-100 text-slate-500 text-sm">
          No Image
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <Link href={href} className="block">
          <h3 className="text-lg font-extrabold leading-snug text-slate-900 text-center">
            {title}
          </h3>
        </Link>

        {item.dateYMD ? (
          <div className="mt-2 text-center text-xs text-slate-500">
            {item.dateYMD}
          </div>
        ) : null}

        <p className="mt-3 text-center text-slate-600 mb-5 text-sm">
          {excerpt}
        </p>

        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-white text-sm font-semibold bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468]"
        >
          {t("readMore", { default: "Baca Selengkapnya" })}
        </Link>
      </div>
    </div>
  );
}

/* ===== Main ===== */
export default function ArtikelCard() {
  const t = useTranslations("artikelCard");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(9);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });

  // === categories ===
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null); // {id, slug, name} | null

  // Ambil kategori dari BE (kalau gagal tetap lanjut—akan dilengkapi dari artikel)
  const loadCats = async () => {
    try {
      const { data } = await api.get("/category-articles", {
        params: { page: 1, size: 200 },
      });
      const rows = data?.data?.category_articles ?? [];
      const list = rows.map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
      setCategories((prev) =>
        uniqBy([...(prev || []), ...list], "id").sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    } catch {
      // silent – fallback dari artikel
    }
  };

  useEffect(() => {
    loadCats();
    const onFocus = () => loadCats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const fetchList = async (pageArg = page, sizeArg = size) => {
    setLoading(true);
    setErr("");
    try {
      const params = { page: pageArg, size: sizeArg };
      if (selectedCat?.id) params.category_id = selectedCat.id;
      if (selectedCat?.slug) params.category = selectedCat.slug;

      const { data } = await api.get("/upload/articles", { params });

      const { articles, totalArticles, totalPages, currentPage } =
        data?.data || {};

      const mapped = (articles || [])
        .filter((a) => a.status !== "draft")
        .sort(
          (a, b) =>
            new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
        )
        .map((a) => ({
          ...a,
          imageUrl: a.imageUrl || buildImageUrl(a.image),
          dateYMD: toYMD(a.date || a.created_at),
        }));

      // Lengkapi kategori dari artikel (union dengan yang sudah ada)
      const fromArticles = uniqBy(
        mapped
          .map(
            (a) =>
              a.category ||
              a.Category ||
              a.CategoryArticle ||
              a.category_article
          )
          .filter(Boolean)
          .map((cat) => ({ id: cat.id, slug: cat.slug, name: cat.name })),
        "id"
      );
      if (fromArticles.length) {
        setCategories((prev) =>
          uniqBy([...(prev || []), ...fromArticles], "id").sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      }

      setRows(mapped);
      setMeta({
        total: totalArticles ?? mapped.length,
        totalPages: Math.max(totalPages || 1, 1),
        currentPage: currentPage || pageArg,
      });
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Gagal memuat artikel");
      setRows([]);
      setMeta({ total: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, selectedCat?.id, selectedCat?.slug]);

  // pagination window (maks 5)
  const makePages = () => {
    const total = meta.totalPages;
    const cur = meta.currentPage;
    const span = 5;
    const half = Math.floor(span / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, start + span - 1);
    if (end - start + 1 < span) start = Math.max(1, end - span + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <section className="py-10 md:py-14">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-5">
        <h3 className="text-center font-semibold" style={{ color: BRAND }}>
          {t("title")}
        </h3>
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto text-center text-slate-600">{t("subheading")}</p>
      </div>

      {/* Category pills */}
      <div className="mx-auto max-w-7xl px-8 md:px-6 mt-6">
        <div
          className="flex gap-4 overflow-x-auto px-3 py-1 [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollbarWidth: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <button
            onClick={() => {
              setSelectedCat(null);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md ring-1 text-xs sm:text-sm cursor-pointer font-semibold ${
              !selectedCat ? "text-white" : "text-slate-800"
            }`}
            style={
              !selectedCat ? { background: BRAND, borderColor: BRAND } : {}
            }
          >
            {t("all", { default: "Semua Artikel" })}
          </button>

          {categories.map((c) => {
            const active =
              selectedCat?.id === c.id || selectedCat?.slug === c.slug;
            return (
              <button
                key={c.id || c.slug}
                onClick={() => {
                  setSelectedCat(c);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-md ring-1 ring-slate-200 text-xs sm:text-sm cursor-pointer font-semibold ${
                  active ? "text-white" : "text-slate-800"
                }`}
                style={active ? { background: BRAND, borderColor: BRAND } : {}}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-8">
        {err ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
            {err}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && rows.length === 0
            ? Array.from({ length: size }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : rows.map((item) => (
                <ArticleCard key={item.id} item={item} t={t} />
              ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.currentPage === 1}
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            {t("prev", { default: "Sebelumnya" })}
          </button>

          {makePages().map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-md grid place-content-center text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                n === meta.currentPage ? "text-white" : "text-slate-700"
              }`}
              style={
                n === meta.currentPage
                  ? { background: BRAND, borderColor: BRAND }
                  : {}
              }
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={meta.currentPage === meta.totalPages}
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            {t("next", { default: "Selanjutnya" })}
          </button>
        </div>
      </div>
    </section>
  );
}
