"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";

// ==== BRAND ====
const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

// ==== helper ====
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `csr/${image}`;
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

// ==== Lazy wrapper: render children hanya saat terlihat ====
function LazyMount({ children, rootMargin = "200px" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ref.current || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
          }
        });
      },
      { rootMargin }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className="h-full">
      {show ? children : <CardSkeleton />}
    </div>
  );
}

// ==== Skeleton card ====
function CardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200 bg-white animate-pulse">
      <div className="h-56 bg-slate-200" />
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="mt-auto h-10 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

// ==== Card ====
function CsrCard({ item, t }) {
  const href = `/keberlanjutan/${item.slug}`;
  const img = buildImageUrl(item.image, item.imageUrl);
  const title = item.title;
  const excerpt = extractExcerpt(item.content);

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 bg-white hover:shadow-md transition">
      <Link href={href} className="block">
        {img ? (
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="h-56 w-full grid place-content-center bg-slate-100 text-slate-500 text-sm">
            No Image
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <Link href={href} className="block">
          <h3 className="font-extrabold text-lg leading-snug line-clamp-2">
            {title?.toUpperCase()}
          </h3>
        </Link>
        <p className="mt-2 text-slate-600 text-sm line-clamp-3">{excerpt}</p>
        <Link
          href={href}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-white text-sm font-semibold"
          style={{ background: BRAND }}
        >
          {t("readMore", { default: "Read More" })}
        </Link>
      </div>
    </div>
  );
}

// ==== Main ====
export default function KeberlanjutanCard() {
  const t = useTranslations("csrListProgram");
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    totalCsr: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchList = async (pageArg = page, sizeArg = size) => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/upload/csr", {
        params: { page: pageArg, size: sizeArg }, // BE tetap apa adanya
      });

      const { csrs = [], totalPages, currentPage } = data.data;

      const published = csrs.filter((x) => x.status === "published");

      if (published.length === 0 && currentPage < totalPages) {
        setPage(currentPage + 1); // loncat ke halaman berikutnya
        return; // jangan set state utk halaman kosong
      }

      setRows(published);
      setMeta({
        totalCsr: published.length, // jumlah item yang tampil di halaman ini
        totalPages, // biarkan pagination BE apa adanya
        currentPage,
      });
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
      setRows([]);
      setMeta({ totalCsr: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return (
    <section className="py-10 md:py-14" id="selengkapnya">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-4">
        <h3 className="text-center font-semibold" style={{ color: BRAND }}>
          {t("title")}
        </h3>
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto text-center text-slate-600">{t("subheading")}</p>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-8">
        {err ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
            {err}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {loading && rows.length === 0
            ? Array.from({ length: size }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : rows.map((item) => (
                <LazyMount key={item.id}>
                  <CsrCard item={item} t={t} />
                </LazyMount>
              ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("prev", { default: "Previous" })}
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-md grid place-content-center text-sm cursor-pointer ring-1 ring-slate-200 ${
                n === meta.currentPage
                  ? "text-white"
                  : "hover:bg-slate-50 text-slate-700"
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
            className="inline-flex items-center gap-1 rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm disabled:opacity-40 cursor-pointer"
          >
            {t("next", { default: "Next" })}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
