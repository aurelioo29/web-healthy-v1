"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { useTranslations } from "next-intl";

/* helpers */
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

const detailPath = (slug) => `/e-catalog/${slug}`;

export default function GenomikCatalogGrid() {
  const t = useTranslations("genomikCard");
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [err, setErr] = React.useState("");

  const [items, setItems] = React.useState([]);
  const [catIds, setCatIds] = React.useState([]);

  // per-kategori pagination map: { [catId]: { page, totalPages } }
  const [pageMap, setPageMap] = React.useState({});
  const PAGE_SIZE = 8; // kecilkan biar load cepat per kategori

  // 1) Fetch semua kategori yang mengandung "genomik"
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const catRes = await api.get("/upload/category-catalogs", {
          params: { size: 100, page: 1, search: "genomik" },
          headers: { "Cache-Control": "no-cache" },
        });

        const box = catRes?.data?.data || {};
        const categories = box.categories || box.items || box.rows || [];

        // filter tegas: name mengandung "genomik" (case-insensitive)
        const wanted = categories.filter((c) =>
          String(c?.name || "")
            .toLowerCase()
            .includes("genomik")
        );

        if (!wanted.length) {
          setErr("Kategori dengan nama mengandung 'Genomik' tidak ditemukan.");
          setCatIds([]);
          setItems([]);
          return;
        }

        const ids = wanted.map((c) => c.id);
        setCatIds(ids);

        // init pageMap semua kategori ke page 0 (nanti dinaikkan saat fetch batch pertama)
        const init = {};
        ids.forEach((id) => (init[id] = { page: 0, totalPages: Infinity }));
        setPageMap(init);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Gagal memuat kategori"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // util: gabung unik by id
  const mergeUnique = React.useCallback((prev, add) => {
    const seen = new Set(prev.map((x) => x.id));
    const next = [...prev];
    for (const it of add) if (!seen.has(it.id)) next.push(it);
    return next;
  }, []);

  // 2) Fetch batch: satu halaman berikutnya untuk SETIAP kategori yang masih punya next page
  const fetchNextBatch = React.useCallback(async () => {
    if (!catIds.length) return;
    const candidates = catIds.filter(
      (id) => (pageMap[id]?.page || 0) < (pageMap[id]?.totalPages || 1)
    );
    if (!candidates.length) return;

    try {
      setLoadingMore(true);
      setErr("");

      // Ambil halaman berikut per kategori secara paralel (Promise.all)
      const reqs = candidates.map((id) => {
        const nextPage = (pageMap[id]?.page || 0) + 1;
        return api
          .get("/upload/catalogs", {
            params: {
              page: nextPage,
              size: PAGE_SIZE,
              status: "published",
              category_id: id,
            },
            headers: { "Cache-Control": "no-cache" },
          })
          .then((res) => ({ id, res, page: nextPage }))
          .catch((e) => ({ id, err: e, page: nextPage }));
      });

      const results = await Promise.all(reqs);

      // kumpulkan item & update pageMap per kategori
      let collected = [];
      const newMap = { ...pageMap };

      for (const r of results) {
        if (r.err) {
          // tidak mematikan semua; catat error ringan
          // eslint-disable-next-line no-console
          console.warn("Catalog fetch failed for cat", r.id, r.err?.message);
          continue;
        }
        const dataBox = r.res?.data?.data || {};
        const catalogs =
          dataBox.catalogs || dataBox.items || dataBox.rows || [];

        const mapped = catalogs.map((x) => ({
          id: x.id,
          slug: x.slug,
          title: x.title,
          imageUrl:
            x.imageUrl || x.image || "/images/catalog-pages/placeholder.png",
          excerpt: truncate(stripHtml(x.content || ""), 210),
          priceOriginal: x.price_original,
          priceDiscount: x.price_discount,
          category: x.category?.name,
          created_at: x.created_at, // kalau mau sorting
        }));
        collected = collected.concat(mapped);

        const totalPages = dataBox.totalPages || 1;
        newMap[r.id] = { page: r.page, totalPages };
      }

      setItems((prev) => mergeUnique(prev, collected));
      setPageMap(newMap);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Gagal memuat katalog");
    } finally {
      setLoadingMore(false);
    }
  }, [catIds, pageMap, PAGE_SIZE, mergeUnique]);

  // 3) auto-load batch pertama saat catIds & pageMap siap
  React.useEffect(() => {
    if (catIds.length && Object.keys(pageMap).length === catIds.length) {
      fetchNextBatch();
    }
  }, [catIds, pageMap, fetchNextBatch]);

  // apakah masih ada halaman tersisa di salah satu kategori?
  const hasMore = React.useMemo(
    () =>
      catIds.some(
        (id) => (pageMap[id]?.page || 0) < (pageMap[id]?.totalPages || 1)
      ),
    [catIds, pageMap]
  );

  return (
    <section className="py-10 md:py-14" id="selengkapnya">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-4">
        <h1 className="text-center text-4xl font-semibold">
          {t("title")}
        </h1>
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

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-6">
        {loading && !items.length ? (
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
            Belum ada katalog di kategori Genomik.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <article
                  key={it.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                >
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
                    {it.category || "Genomik"}
                  </div>

                  <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">
                    {it.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {truncate(stripHtml(it.excerpt || ""), 210)}
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
                      className="inline-flex items-center justify-center rounded-lg bg-[#2E6F63] px-4 py-2.5 text-white hover:bg-[#24584F] transition"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Load more (round-robin per kategori) */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  disabled={loadingMore}
                  onClick={fetchNextBatch}
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
