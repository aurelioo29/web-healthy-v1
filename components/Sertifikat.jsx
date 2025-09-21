"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Sertifikat() {
  const t = useTranslations("sertifikat");

  const safeT = (key) => {
    try {
      return t(key);
    } catch {
      return undefined;
    }
  };

  const keys = ["card1", "card2", "card3", "card4"];
  const fallbackImgs = [
    "/images/about-pages/sertifikat-1.webp",
    "/images/about-pages/sertifikat-2.webp",
    "/images/about-pages/sertifikat-3.webp",
    "/images/about-pages/sertifikat-4.webp",
  ];

  const cards = keys.map((k, i) => ({
    title: safeT(`cards.${k}.title`) ?? `Sertifikat ${i + 1}`,
    img: safeT(`cards.${k}.img`) ?? fallbackImgs[i],
    alt:
      safeT(`cards.${k}.imageAlt`) ??
      safeT(`cards.${k}.title`) ??
      `Certificate ${i + 1}`,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      {/* Heading */}
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
          {cards.map((c, i) => (
            <SwiperSlide key={i}>
              <Card {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Card({ img, alt, title }) {
  return (
    <article className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      {/* Poster sertifikat: contain supaya tidak crop/zoom */}
      <div className="relative w-full aspect-[4/3] bg-white">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
          className="object-contain"
          priority={false}
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="font-semibold">{title}</h3>
      </div>
    </article>
  );
}
