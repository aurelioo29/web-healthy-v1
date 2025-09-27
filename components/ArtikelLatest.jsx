"use client";

import React, { useEffect, useRef, useState } from "react";
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

/* ===== Skeleton ===== */
function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white animate-pulse h-full flex flex-col">
      <div className="h-56 bg-slate-200" />
      <div className="p-6 gap-3 flex-1 flex flex-col">
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
    <div className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white h-full flex flex-col hover:shadow-md transition">
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
          <h3 className="text-center font-extrabold text-lg leading-snug">
            {title}
          </h3>
        </Link>

        <p className="mt-3 mb-10 text-center text-slate-600 text-sm">
          {excerpt}
        </p>

        {/* tombol selalu di bawah */}
        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-white text-sm font-semibold"
          style={{ background: BRAND }}
        >
          {t("readMore", { default: "Baca Selengkapnya" })}
        </Link>
      </div>
    </div>
  );
}

function AutoSwiper({ items, renderItem, interval = 5000, showDots = true }) {
  const wrapRef = useRef(null); // wrapper yang kelihatan di viewport
  const trackRef = useRef(null); // kontainer yang di-scroll horizontal
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  // Pause kalau slider-nya lagi off-screen (tidak terlihat di viewport)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  // Update index aktif berdasarkan slide yang tampak di dalam track
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIdx(Number(e.target.dataset.idx || 0));
          }
        });
      },
      { root, threshold: 0.6 }
    );

    Array.from(root.children).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count]);

  // Scroll hanya kontainer horizontal (bukan halaman) → tanpa jump ke section lain
  const goTo = (i) => {
    const root = trackRef.current;
    if (!root) return;
    const dest = root.querySelector(`[data-idx="${i}"]`);
    if (!dest) return;

    // hitung pergeseran relatif terhadap track
    const rootRect = root.getBoundingClientRect();
    const destRect = dest.getBoundingClientRect();
    const left = root.scrollLeft + (destRect.left - rootRect.left);

    root.scrollTo({ left, behavior: "smooth" });
  };

  // Autoplay
  useEffect(() => {
    if (!count) return;
    const id = setInterval(() => {
      if (!paused) goTo((idx + 1) % count);
    }, interval);
    return () => clearInterval(id);
  }, [idx, paused, count, interval]);

  return (
    <div
      ref={wrapRef}
      className="relative pb-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory px-1 -mx-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10"
      >
        {items.map((it, i) => (
          <div
            key={it.id ?? i}
            data-idx={i}
            className="snap-start shrink-0 w-[88%] sm:w-[70%] md:w-1/2 lg:w-1/3"
          >
            {renderItem(it)}
          </div>
        ))}
      </div>

      {showDots && count > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 w-2 rounded-full ${
                i === idx ? "bg-[--brand]" : "bg-slate-300"
              }`}
              style={{ "--brand": BRAND }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Main ===== */
export default function ArtikelLatest() {
  const t = useTranslations("artikelLatest");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/upload/articles", {
          params: { page: 1, size: 12 },
        });

        const list = (data?.data?.articles || [])
          .filter((a) => a.status !== "draft")
          .sort(
            (a, b) =>
              new Date(b.date || b.created_at).getTime() -
              new Date(a.date || a.created_at).getTime()
          )
          .map((a) => ({
            ...a,
            imageUrl: a.imageUrl || buildImageUrl(a.image),
          }));

        setRows(list);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Gagal memuat artikel"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return (
    <section className="py-10 md:py-14 mt-20" id="selengkapnya">
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

      <div className="mx-auto max-w-7xl px-4 md:px-6 mt-8">
        {err ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
            {err}
          </div>
        ) : null}

        {/* Swiper */}
        {loading && rows.length === 0 ? (
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[88%] sm:w-[70%] md:w-1/2 lg:w-1/3"
              >
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <AutoSwiper
            items={rows.slice(0, 12)}
            interval={5000}
            showDots={true} // panah dihapus: tak ada tombol kanan/kiri
            renderItem={(item) => <ArticleCard item={item} t={t} />}
          />
        )}
      </div>
    </section>
  );
}
