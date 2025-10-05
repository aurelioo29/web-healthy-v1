"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import api from "@/lib/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Quote } from "lucide-react";

/* ===== Helpers ===== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const AVATAR_PLACEHOLDER = "/icons/auth/avatar.webp"; // opsional, boleh diganti/dihapus

const buildImageUrl = (image, imageUrlFromBE, folder = "testimonis") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return AVATAR_PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return AVATAR_PLACEHOLDER;
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

function getYouTubeId(input = "") {
  const s = String(input).trim();
  if (!s) return ""; // tidak ada video
  // Kalau sudah 11-char id
  if (/^[\w-]{11}$/.test(s)) return s;

  try {
    const u = new URL(s);
    // https://www.youtube.com/watch?v=VIDEOID
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    // https://youtu.be/VIDEOID
    const parts = u.pathname.split("/").filter(Boolean);
    // /embed/VIDEOID, /shorts/VIDEOID, /VIDEOID
    if (u.hostname.includes("youtu.be")) return parts[0] || "";
    if (parts[0] === "embed" || parts[0] === "shorts") return parts[1] || "";
    return "";
  } catch {
    // fallback: mungkin memang sudah id tapi tidak lulus regex
    return s;
  }
}

const fmtTitleLine = (job, age) => {
  const bits = [];
  if (job) bits.push(job);
  if (Number.isFinite(Number(age))) bits.push(`${age} tahun`);
  return bits.join(", ");
};

/* ===== Component ===== */
export default function TestimoniVideo() {
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Ambil 5 terbaru
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/upload/testimonis", {
          params: { page: 1, size: 5 }, // cukup 5 terbaru
          headers: { "Cache-Control": "no-cache" },
        });

        const payload = res?.data?.data;
        let list = Array.isArray(payload)
          ? payload
          : payload?.items ||
            payload?.rows ||
            payload?.data ||
            payload?.testimonis ||
            [];

        // Safety: urutkan DESC by created_at bila BE tidak mengurutkan
        list = [...list].sort((a, b) => {
          const da = new Date(a.created_at || a.createdAt || 0).getTime();
          const db = new Date(b.created_at || b.createdAt || 0).getTime();
          return db - da;
        });

        // Map -> slides
        const mapped = list.slice(0, 5).map((t) => ({
          quote: t.content || "",
          name: t.name || "",
          title: fmtTitleLine(t.job, t.age),
          avatar: buildImageUrl(t.image, t.imageUrl, "testimonis"),
          videoId: getYouTubeId(t.link_video || ""),
        }));

        if (alive) setSlides(mapped);
      } catch (e) {
        if (alive) setSlides([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const vid = slides[active]?.videoId;
  const hasVideo = Boolean(vid);

  if (!slides.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Apa Kata Mereka?
        </h2>
        <p className="text-slate-500">Belum ada testimoni.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      {/* Mobile: stack; Desktop: 2 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start md:items-center gap-8 md:gap-10">
        <div className="order-1">
          <h2 className="text-2xl md:text-3xl font-bold">Apa Kata Mereka?</h2>

          <Swiper
            modules={[Pagination, A11y, Autoplay, Keyboard]}
            slidesPerView={1}
            spaceBetween={16}
            autoHeight
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            autoplay={{ delay: 8000, disableOnInteraction: false }}
            loop={slides.length > 1}
            onSlideChange={(s) => {
              setActive(s.realIndex);
              setPlaying(false);
            }}
            className="testi-swiper mt-6 !pb-8 md:!pb-6"
            style={{
              "--swiper-pagination-bottom": "0px",
              "--swiper-pagination-bullet-size": "8px",
              "--swiper-pagination-bullet-horizontal-gap": "6px",
              "--swiper-pagination-color": "#4698E3",
              "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
              "--swiper-pagination-bullet-inactive-opacity": "1",
            }}
          >
            {slides.map((s, i) => (
              <SwiperSlide key={i}>
                <figure className="max-w-xl">
                  <Quote className="text-[#4698E3]" />
                  {s.quote ? (
                    <blockquote className="mt-2 text-[#0f172a] leading-relaxed">
                      {s.quote}
                    </blockquote>
                  ) : null}

                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#e2e8f0]">
                      <Image
                        src={s.avatar || AVATAR_PLACEHOLDER}
                        alt={s.name || "Avatar"}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0f172a]">
                        {s.name || "Anonim"}
                      </div>
                      {s.title ? (
                        <div className="text-sm text-[#64748b]">{s.title}</div>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="order-2 rounded-2xl overflow-hidden bg-black/5">
          <div className="relative aspect-video">
            {hasVideo && playing ? (
              <iframe
                key={vid}
                src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : hasVideo ? (
              <>
                <Image
                  src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
                  alt="YouTube preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 grid place-items-center group"
                  aria-label="Play video"
                >
                  <span className="grid place-items-center h-16 w-16 rounded-full bg-white/90 shadow-lg group-hover:scale-105 transition">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-[#0f172a] translate-x-[1px]"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              </>
            ) : (
              // Tidak ada link_video → tampilkan avatar besar orang aktif
              <div className="absolute inset-0 grid place-items-center bg-white">
                <div className="relative h-40 w-40 overflow-hidden rounded-full ring-4 ring-[#e2e8f0]">
                  <Image
                    src={slides[active]?.avatar || AVATAR_PLACEHOLDER}
                    alt={slides[active]?.name || "Avatar"}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
