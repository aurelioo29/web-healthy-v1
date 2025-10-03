"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Quote } from "lucide-react";

export default function TestimoniVideo() {
  const slides = [
    {
      quote:
        "Pengambilan sample DNA test sangat cepat dan nyaman, recommended untuk anak-anak juga. Thank you Royal Klinik!",
      name: "Ridho Hafiedz & Seroja Hafiedz",
      title: "Musician, Selebritis, 50 tahun.",
      avatar: "/images/avatars/ridho-seroja.jpg",
      videoId: "dQw4w9WgXcQ",
    },
    {
      quote:
        "Timnya ramah, hasil jelas, dan prosesnya rapi. Ini pengalaman medical paling halus sejauh ini.",
      name: "Dina Larasati",
      title: "Ibu Rumah Tangga",
      avatar: "/images/avatars/dina.jpg",
      videoId: "kffacxfA7G4",
    },
    {
      quote:
        "Booking gampang, hasil cepat. Cocok buat yang jadwalnya ketat tapi butuh akurasi.",
      name: "Bintang Pratama",
      title: "Karyawan Swasta",
      avatar: "/images/avatars/bintang.jpg",
      videoId: "ysz5S6PUM-U",
    },
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vid = slides[active]?.videoId;

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
                  <blockquote className="mt-2 text-[#0f172a] leading-relaxed">
                    {s.quote}
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#e2e8f0]">
                      <Image
                        src={s.avatar}
                        alt={s.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0f172a]">
                        {s.name}
                      </div>
                      <div className="text-sm text-[#64748b]">{s.title}</div>
                    </div>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="order-2 rounded-2xl overflow-hidden bg-black/5">
          <div className="relative aspect-video">
            {playing ? (
              <iframe
                key={vid}
                src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
