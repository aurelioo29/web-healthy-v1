"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

/* ===== Konstanta asset LAN ===== */
const IMAGE_BASE = "https://admin.royal-klinik.cloud//storage/assets";
const VIDEO_BASE = "https://admin.royal-klinik.cloud//storage/assets";
const AVATAR_PLACEHOLDER = "/icons/auth/avatar.webp";

/* ===== Helpers ===== */
const buildAbsUrl = (base, file) => {
  const f = String(file || "").trim();
  if (!f) return "";
  if (/^https?:\/\//i.test(f)) return f;
  return `${base.replace(/\/$/, "")}/${f.replace(/^\//, "")}`;
};

function getYouTubeId(input = "") {
  const s = String(input).trim();
  if (!s) return "";
  if (/^[\w-]{11}$/.test(s)) return s; // sudah ID
  try {
    const u = new URL(s);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname.includes("youtu.be")) return parts[0] || "";
    if (parts[0] === "embed" || parts[0] === "shorts") return parts[1] || "";
    return "";
  } catch {
    return ""; // bukan URL YouTube
  }
}

const fmtTitleLine = (job, age) => {
  const bits = [];
  if (job) bits.push(job);
  if (age) bits.push(`${age} tahun`);
  return bits.join(", ");
};

/* ===== Komponen ===== */
export default function TestimoniVideo() {
  const t = useTranslations("testimoni");
  const [slides, setSlides] = React.useState([]);
  const [active, setActive] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Ambil langsung dari proxy Next (tidak kena CORS)
        const r = await fetch("/api/testimonis", { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const list = await r.json(); // ← hasil normalisasi dari route.js kamu

        // Map sesuai field Laravel kamu
        const mapped = (list || [])
          .map((t) => {
            const name = t.nama_testimoni || "";
            const age = t.umur || "";
            const job = t.pekerjaan || "";
            const quote = t.isi_testimoni || "";
            const img = buildAbsUrl(IMAGE_BASE, t.foto);
            const videoRaw = t.link_video || "";

            // Deteksi YouTube vs file MP4
            const ytId = getYouTubeId(videoRaw);
            const videoUrl = ytId ? "" : buildAbsUrl(VIDEO_BASE, videoRaw);

            return {
              name,
              title: fmtTitleLine(job, age),
              quote,
              avatar: img || AVATAR_PLACEHOLDER,
              ytId,
              videoUrl, // bisa kosong kalau bukan MP4
              createdAt: t.created_at || t.updated_at || "",
            };
          })
          // urutkan terbaru (opsional)
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          )
          .slice(0, 5);

        if (alive) setSlides(mapped);
      } catch {
        if (alive) setSlides([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const current = slides[active];
  const hasYouTube = Boolean(current?.ytId);
  const hasMp4 = Boolean(
    current?.videoUrl && /\.mp4(\?|$)/i.test(current.videoUrl)
  );

  if (!slides.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t("title")}
        </h2>
        <p className="text-slate-500">Belum ada testimoni.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 items-start md:items-center gap-8 md:gap-10">
        {/* Kiri: teks & slider quote */}
        <div className="order-1">
          <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>

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

        {/* Kanan: video / poster */}
        <div className="order-2 rounded-2xl overflow-hidden bg-black/5">
          <div className="relative aspect-video">
            {/* YouTube */}
            {hasYouTube && playing ? (
              <iframe
                key={current.ytId}
                src={`https://www.youtube-nocookie.com/embed/${current.ytId}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : hasYouTube ? (
              <>
                <Image
                  src={`https://i.ytimg.com/vi/${current.ytId}/hqdefault.jpg`}
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
            ) : null}

            {/* MP4 (file lokal dari server) */}
            {!hasYouTube && hasMp4 ? (
              <video
                key={current.videoUrl}
                controls
                className="absolute inset-0 h-full w-full object-cover bg-black"
                poster={current.avatar || AVATAR_PLACEHOLDER}
              >
                <source src={current.videoUrl} type="video/mp4" />
                Browser Anda tidak mendukung pemutar video.
              </video>
            ) : null}

            {/* Fallback avatar besar */}
            {!hasYouTube && !hasMp4 ? (
              <div className="absolute inset-0 grid place-items-center bg-white">
                <div className="relative h-40 w-40 overflow-hidden rounded-full ring-4 ring-[#e2e8f0]">
                  <Image
                    src={current?.avatar || AVATAR_PLACEHOLDER}
                    alt={current?.name || "Avatar"}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
