"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useTranslations } from "next-intl";

/* ==== ImagePreview persis seperti punyamu ==== */
function ImagePreview({ open, src, alt, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml || "";
      document.body.style.overflow = prevBody || "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Preview"}
          className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
        />
        <div className="mt-3 flex items-center justify-between text-slate-200">
          <div className="text-sm line-clamp-1">{alt || "Preview"}</div>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
              title="Open in new tab"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Close preview"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==== utils fetch & url ==== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const join = (base, path) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\/+/, "")}`;

const makeImgUrl = (image, imageUrl) => {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return join(ASSET_BASE, image);
};

const fmtYMD = (v) => {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const unwrap = (o) =>
  o?.data !== undefined ? o.data : o?.result !== undefined ? o.result : o;

/* ==== fetch hanya published ==== */
async function fetchPromosPublished() {
  try {
    const url = join(API_BASE, "/upload/event-promos");
    const qs = new URLSearchParams({
      status: "published",
      page: "1",
      size: "30",
    });
    const res = await fetch(`${url}?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const box = unwrap(json);

    let list =
      (Array.isArray(box) && box) ||
      box?.rows ||
      box?.items ||
      box?.event_promos ||
      box?.eventPromos ||
      box?.list ||
      [];

    // jaga2
    list = list.filter(
      (p) => String(p.status || "").toLowerCase() === "published"
    );

    return list.map((p, i) => ({
      id: p.id ?? i,
      title: p.title || "",
      date: fmtYMD(p.date || p.created_at),
      status: p.status,
      imageUrl: makeImgUrl(p.image, p.imageUrl),
    }));
  } catch {
    return [];
  }
}

/* ==== Komponen utama ==== */
export default function EventPromo() {
  const t = useTranslations("eventPromo");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // state untuk preview
  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });
  const openPreview = (src, alt = "") => setPreview({ open: true, src, alt });
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchPromosPublished();
      if (!alive) return;
      setSlides(data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-6">
      <div className="mb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold">{t("title")}</h2>
        <p className="mt-1 md:text-lg">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="h-60 grid place-items-center text-slate-500">
          Loading…
        </div>
      ) : slides.length === 0 ? (
        <div className="h-60 grid place-items-center text-slate-500">
          No promo found.
        </div>
      ) : (
        <Swiper
          modules={[Pagination, Autoplay, A11y, Keyboard]}
          slidesPerView={1}
          spaceBetween={16}
          loop={slides.length > 1}
          keyboard={{ enabled: true }}
          autoplay={{ delay: 10000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="overflow-hidden md:rounded-3xl shadow ring-1 ring-black/5"
        >
          {slides.map((s, idx) => (
            <SwiperSlide key={s.id || idx}>
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[7/4]">
                <Image
                  src={encodeURI(s.imageUrl || "/images/placeholder.png")}
                  alt={s.title || `Promo ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="bg-white object-contain sm:object-contain object-[60%_40%] sm:object-center"
                  priority={idx === 0}
                />

                {/* tombol transparan menutupi gambar => buka modal preview */}
                <button
                  type="button"
                  onClick={() => openPreview(s.imageUrl, s.title)}
                  className="absolute inset-0 z-10 cursor-zoom-in"
                  aria-label={`Preview ${s.title || `Promo ${idx + 1}`}`}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* modal preview */}
      <ImagePreview
        open={preview.open}
        src={preview.src}
        alt={preview.alt}
        onClose={closePreview}
      />
    </section>
  );
}
