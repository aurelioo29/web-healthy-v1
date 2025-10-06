"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

/* ===== Const & helpers ===== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";

const imgUrl = (image, imageUrlFromBE, folder = "articles") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return PLACEHOLDER;
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const makeExcerpt = (a, n = 180) => {
  const src = a.excerpt?.trim()
    ? stripHtml(a.excerpt)
    : stripHtml(a.content || "");
  return src.length > n ? `${src.slice(0, n).trim()}…` : src;
};

const fmtDate = (s) =>
  s
    ? new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(new Date(s))
    : "";

const isKesehatan = (a) => {
  const cands = [
    a?.category?.name,
    a?.category,
    a?.categoryName,
    // kalau array:
    ...(Array.isArray(a?.categories)
      ? a.categories.map((c) => c?.name || c)
      : []),
    ...(Array.isArray(a?.tags) ? a.tags : []),
  ]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase());
  return cands.some((x) => x.includes("kesehatan"));
};

const byNewest = (a, b) =>
  new Date(b?.date || b?.created_at || 0) -
  new Date(a?.date || a?.created_at || 0);

/* ===== Featured card ===== */
function Featured({ a }) {
  return (
    <article className="mt-8 overflow-hidden rounded-3xl ring-1 ring-slate-200 bg-white">
      <Link href={`/artikel-kesehatan/${a.slug}`} className="block">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src={imgUrl(a.image, a.imageUrl)}
            alt={a.title}
            fill
            className="object-cover"
            sizes="100vw"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
            priority
          />
        </div>
      </Link>

      <div className="px-4 py-4 md:px-6 md:py-6">
        <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {(a.category?.name || a.categoryName || "Kesehatan").toUpperCase()}
        </span>
        <Link href={`/artikel-kesehatan/${a.slug}`}>
          <h3 className="mt-3 text-xl md:text-2xl font-semibold leading-snug hover:underline">
            {a.title}
          </h3>
        </Link>
        <p className="mt-2 text-slate-600">{makeExcerpt(a, 220)}</p>
      </div>
    </article>
  );
}

/* ===== Row card ===== */
function RowCard({ a }) {
  return (
    <article className="grid grid-cols-[104px_1fr] gap-4 md:grid-cols-[220px_1fr]">
      <Link
        href={`/artikel-kesehatan/${a.slug}`}
        className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-50"
      >
        <Image
          src={imgUrl(a.image, a.imageUrl)}
          alt={a.title}
          fill
          sizes="(max-width:768px) 40vw, 220px"
          className="object-cover"
        />
      </Link>

      <div>
        <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 md:text-xs">
          {(a.category?.name || a.categoryName || "Kesehatan").toUpperCase()}
        </span>

        <Link href={`/artikel-kesehatan/${a.slug}`}>
          <h4 className="mt-2 text-base md:text-lg font-semibold leading-snug hover:underline">
            {a.title}
          </h4>
        </Link>

        <p className="mt-1 text-sm text-slate-600 line-clamp-3">
          {makeExcerpt(a, 180)}
        </p>

        <div className="mt-2 text-xs text-slate-500">
          {fmtDate(a.date || a.created_at)}
        </div>
      </div>
    </article>
  );
}

/* ===== Section ===== */
export default function BeritaHome() {
  const t = useTranslations("beritaHome");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 1) Coba filter kategori langsung dari BE (jika tersedia).
        let res = await api.get("/upload/articles", {
          params: {
            status: "published",
            category: "kesehatan", // <-- kalau BE support
            sort: "date:desc",
            page: 1,
            size: 5,
          },
        });
        let list = res?.data?.data?.articles || [];

        // 2) Fallback: ambil banyak lalu filter & sort di FE.
        if (!list.length) {
          const all = await api.get("/upload/articles", {
            params: { status: "published", page: 1, size: 50 },
          });
          const allList = all?.data?.data?.articles || [];
          list = allList.filter(isKesehatan).sort(byNewest).slice(0, 5);
        }

        if (alive) setRows(list);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
          <p className="mt-2 text-slate-600">{t("desc")}</p>
        </div>
        <div className="mt-8 animate-pulse space-y-6">
          <div className="h-64 rounded-3xl bg-slate-200" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[104px_1fr] gap-4 md:grid-cols-[220px_1fr]"
            >
              <div className="aspect-[4/3] rounded-xl bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!rows.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-2 text-slate-600">{t("desc")}</p>
      </div>

      {/* Featured */}
      <Featured a={rows[0]} />

      {/* 4 lainnya */}
      <div className="mt-10 space-y-10">
        {rows.slice(1).map((a) => (
          <RowCard key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}
