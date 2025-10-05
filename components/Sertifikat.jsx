"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/pagination";

/* =========================
   ENV & helpers
========================= */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const buildApiUrl = (path, params = {}) => {
  const base = API_BASE.replace(/\/$/, "");
  const qs = new URLSearchParams(params);
  return `${base}${path}${qs.toString() ? `?${qs}` : ""}`;
};

const ensureImageUrl = (imageUrl, image) => {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return `${ASSET_BASE.replace(/\/$/, "")}/${String(image).replace(
    /^\/+/,
    ""
  )}`;
};

const fmtYMD = (v) => {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const isPublished = (x) =>
  String(x?.status || "").toLowerCase() === "published";

// Ambil list dari payload dengan banyak kemungkinan key
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.rows,
    payload.list,
    payload.results,
    payload.data, // kadang langsung array
    payload.about_us_sertifikat,
    payload.aboutUsSertifikat,
    payload.sertifikats,
    payload.sertifikat,
    payload.records,
    payload.collection,
    payload.entries,
  ].filter(Boolean);

  const top = candidates.find(Array.isArray);
  if (top) return top;

  for (const v of Object.values(payload)) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const inner = extractList(v);
      if (inner.length) return inner;
    }
  }
  return [];
};

/* =========================
   Modal Preview
========================= */
function ImagePreview({ open, src, alt, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
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
          className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20 bg-white"
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

/* =========================
   Sertifikat (FE)
========================= */
export default function Sertifikat() {
  const t = useTranslations("sertifikat");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          buildApiUrl("/upload/about-us-sertifikat", { status: "published" }),
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const payload = json?.data ?? json;
        const list = extractList(payload)
          .filter(isPublished)
          .map((s) => ({
            id: s.id,
            title: s.title || "",
            date: fmtYMD(s.date || s.created_at),
            imageUrl: ensureImageUrl(s.imageUrl, s.image),
          }))
          .filter((x) => x.imageUrl);

        // Sort terbaru dulu (kalau ada date)
        list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        if (alive) setRows(list);
      } catch (e) {
        if (alive) setErr(e.message || "Gagal memuat sertifikat");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Kalau kosong, jangan render section
  if (err) {
    return null;
  }
  if (!rows.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-4 text-[#667289]">{t("description")}</p>
      </div>

      <div className="mt-8">
        <Swiper
          modules={[Pagination, A11y]}
          a11y={{ enabled: true }}
          slidesPerView={1}
          spaceBetween={16}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="sertif-swiper !pb-8"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
            "--swiper-pagination-color": "#4698E3",
            "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          {rows.map((c) => (
            <SwiperSlide key={c.id}>
              <article className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                <button
                  type="button"
                  onClick={() =>
                    setPreview({ open: true, src: c.imageUrl, alt: c.title })
                  }
                  className="relative w-full aspect-[4/3] bg-white"
                  aria-label={`Preview ${c.title}`}
                >
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </button>
                <div className="p-4 text-center">
                  <h3 className="font-semibold line-clamp-2">{c.title}</h3>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <ImagePreview
        open={preview.open}
        src={preview.src}
        alt={preview.alt}
        onClose={() => setPreview({ open: false, src: "", alt: "" })}
      />
    </section>
  );
}
