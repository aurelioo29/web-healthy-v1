"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, FreeMode, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Value() {
  const t = useTranslations("value");

  const keys = ["card1", "card2", "card3", "card4", "card5"];
  const cards = keys.map((k) => ({
    title: t(`cards.${k}.title`),
    desc: t(`cards.${k}.desc`),
    img: t(`cards.${k}.img`),
    alt: t(`cards.${k}.imageAlt`),
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-4 text-[#667289]">{t("description")}</p>
      </div>

      {/* MOBILE: Swiper */}
      <div className="mt-8 md:hidden">
        <Swiper
          modules={[Pagination, FreeMode, A11y]}
          a11y={{ enabled: true }}
          freeMode={{ enabled: true, momentumBounce: false }}
          slidesPerView={"auto"}
          spaceBetween={16}
          pagination={{ clickable: true }}
          className="value-swiper !pb-8"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
            "--swiper-pagination-color": "#4698E3",
            "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          {cards.map((c, i) => (
            <SwiperSlide key={i} className="!w-[80%] xs:!w-[300px]">
              <ValueCard {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP/TABLET: Grid */}
      <div className="mt-10 hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {cards.map((c, i) => (
          <ValueCard key={i} {...c} />
        ))}
      </div>

      {/* bullet styling (tambahan aman) */}
      <style jsx global>{`
        .value-swiper .swiper-pagination-bullet {
          background: var(--swiper-pagination-bullet-inactive-color) !important;
          opacity: var(--swiper-pagination-bullet-inactive-opacity) !important;
        }
        .value-swiper .swiper-pagination-bullet-active {
          background: var(--swiper-pagination-color) !important;
        }
      `}</style>
    </section>
  );
}

function ValueCard({ title, desc, img, alt }) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg flex flex-col">
      {/* Poster */}
      <div className="relative w-full aspect-[3/4]">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(max-width:768px) 90vw, (max-width:1024px) 30vw, 18vw"
          className="object-cover"
        />
      </div>

      {/* Body – tinggi seragam */}
      <div className="flex grow flex-col p-4 text-center">
        <h3 className="text-base md:text-xl font-bold pt-2 leading-6 line-clamp-2 min-h-[48px]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-700 leading-6 min-h-[96px]">
          {desc}
        </p>
      </div>
    </article>
  );
}
