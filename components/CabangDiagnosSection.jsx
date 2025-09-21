"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { branches, CATEGORIES, toSlug } from "@/data/branches";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const TABS = [
  { key: CATEGORIES.LAB, label: "Laboratorium Utama" },
  { key: CATEGORIES.CLINIC, label: "Klinik" },
  { key: CATEGORIES.NETWORK, label: "Mitra dan Jaringan" },
];

export default function CabangDiagnosSection() {
  const [active, setActive] = useState(CATEGORIES.LAB);
  const items = useMemo(
    () => branches.filter((b) => b.category === active),
    [active]
  );

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-full px-6 py-2 text-sm font-medium ring-1 transition cursor-pointer
                ${
                  isActive
                    ? "bg-[#4698E3] text-white ring-transparent"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* MOBILE: Swiper only */}
      <div className="md:hidden">
        <Swiper
          modules={[FreeMode, Pagination, A11y]}
          freeMode={{ enabled: true, momentumBounce: false }}
          slidesPerView="auto" // lebar ikut slide
          spaceBetween={16}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="branch-swiper !pb-8"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
            "--swiper-pagination-color": "#4698E3",
            "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          {items.map((b) => (
            <SwiperSlide
              key={b.name}
              className="!w-[85%] xs:!w-[320px] sm:!w-[360px]"
            >
              <Card branch={b} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP/TABLET: grid biasa */}
      <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b) => (
          <Card key={b.name} branch={b} />
        ))}
      </div>

      {/* bullet styling jaga-jaga */}
      <style jsx global>{`
        .branch-swiper .swiper-pagination-bullet {
          background: var(--swiper-pagination-bullet-inactive-color) !important;
          opacity: var(--swiper-pagination-bullet-inactive-opacity) !important;
        }
        .branch-swiper .swiper-pagination-bullet-active {
          background: var(--swiper-pagination-color) !important;
        }
      `}</style>
    </section>
  );
}

function Card({ branch }) {
  const slug = toSlug(branch.name);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold leading-snug">{branch.name}</h3>
      <p className="mt-3 flex-1 text-sm text-slate-700 line-clamp-4">
        {branch.address}
      </p>
      <Link
        href={`/cabang-diagnos/${slug}`}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#4698E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b86cf] transition"
      >
        Selengkapnya
      </Link>
    </article>
  );
}
