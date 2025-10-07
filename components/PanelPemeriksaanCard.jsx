"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { useTranslations } from "next-intl";

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const truncate = (s = "", n = 140) =>
  s.length > n ? s.slice(0, n - 1).trim() + "…" : s;
const formatIDR = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

const categoryName = "Panel Pemeriksaan";
const categorySlug = "panel-pemeriksaan";
const detailPath = (slug) => `/e-catalog/${slug}`;

export default function PanelPemeriksaanCard() {
  const t = useTranslations("panelPemeriksaanCard");

  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [items, setItems] = React.useState([]);

  const [page, setPage] = React.useState(1);
  const [size] = React.useState(12);
  const [totalPages, setTotalPages] = React.useState(1);
  const [categoryId, setCategoryId] = React.useState(null);

  const sentinelRef = React.useRef(null);

  // 1) Cari kategori sekali
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const catRes = await api.get("/upload/category-catalogs", {
          params: { size: 50, page: 1, search: "panel" },
          headers: { "Cache-Control": "no-cache" },
        });

        const catBox = catRes?.data?.data || {};
        const categories =
          catBox.categories || catBox.items || catBox.rows || [];
        const cat =
          categories.find(
            (c) =>
              String(c?.name).toLowerCase() === categoryName.toLowerCase() ||
              String(c?.slug).toLowerCase() === categorySlug.toLowerCase()
          ) || null;

        if (!cat?.id) {
          setErr("Kategori 'Panel Pemeriksaan' tidak ditemukan.");
          setLoading(false);
          return;
        }
        setCategoryId(cat.id);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Fetch halaman (append)
  const fetchPage = React.useCallback(
    async (targetPage) => {
      if (!categoryId) return;
      const firstLoad = targetPage === 1 && items.length === 0;

      try {
        firstLoad ? setLoading(true) : setLoadingMore(true);
        setErr("");

        const listRes = await api.get("/upload/catalogs", {
          params: {
            page: targetPage,
            size,
            status: "published",
            category_id: categoryId,
          },
          headers: { "Cache-Control": "no-cache" },
        });

        const box = listRes?.data?.data || {};
        const catalogs = box.catalogs || box.items || box.rows || [];
        const mapped = catalogs.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          imageUrl:
            r.imageUrl || r.image || "/images/catalog-pages/placeholder.png",
          excerpt: truncate(stripHtml(r.content || ""), 210),
          priceOriginal: r.price_original,
          priceDiscount: r.price_discount,
          category: r.category?.name,
        }));

        setItems((prev) => (targetPage === 1 ? mapped : [...prev, ...mapped]));
        setTotalPages(box.totalPages || 1);
        setPage(targetPage);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Gagal memuat data");
      } finally {
        firstLoad ? setLoading(false) : setLoadingMore(false);
      }
    },
    [categoryId, size, items.length]
  );

  // 3) Trigger fetch saat categoryId siap (halaman 1)
  React.useEffect(() => {
    if (categoryId) fetchPage(1);
  }, [categoryId, fetchPage]);

  // 4) IntersectionObserver untuk infinite scroll
  React.useEffect(() => {
    if (!sentinelRef.current) return;
    if (page >= totalPages) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore) {
          fetchPage(page + 1);
        }
      },
      { rootMargin: "200px 0px" } // pre-load 200px sebelum mentok
    );

    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [page, totalPages, loadingMore, fetchPage]);

  return (
    <section className="py-10 md:py-14" id="selengkapnya">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-4">
        <h1 className="text-center text-4xl font-semibold">{t("title")}</h1>
        <p className="mx-auto text-center text-slate-600">{t("desc")}</p>
      </div>

      {/* Status */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-8">
        {err ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>

      {/* Grid Kartu */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="h-40 w-full rounded-xl bg-slate-100" />
                <div className="mt-3 h-3 w-24 rounded bg-slate-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-16 w-full rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-9 w-full rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
            Belum ada katalog di kategori ini.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <article
                  key={it.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                >
                  {/* Image (Next/Image lazy by default) */}
                  <div className="relative h-56 w-full overflow-hidden rounded-xl">
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      priority={false}
                    />
                  </div>

                  <div className="mt-3 text-xs font-medium text-slate-500">
                    {it.category || "Panel Pemeriksaan"}
                  </div>

                  <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">
                    {it.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {it.excerpt}
                  </p>

                  <div className="mt-3">
                    {Number(it.priceOriginal) > 0 &&
                    Number(it.priceDiscount) < Number(it.priceOriginal) ? (
                      <>
                        <div className="text-lg text-red-600 line-through">
                          {formatIDR(it.priceOriginal)}
                        </div>
                        <div className="text-lg font-semibold text-slate-900">
                          {formatIDR(it.priceDiscount)}
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-semibold text-slate-900">
                        {formatIDR(it.priceDiscount || it.priceOriginal || 0)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <Link
                      href={detailPath(it.slug)}
                      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-4 py-2.5 text-white hover:bg-[#24584F] transition"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Sentinel untuk infinite scroll */}
            <div ref={sentinelRef} className="h-6" />

            {/* Fallback tombol kalau IO gagal / user pengen manual */}
            {page < totalPages && (
              <div className="mt-6 flex justify-center">
                <button
                  disabled={loadingMore}
                  onClick={() => fetchPage(page + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
