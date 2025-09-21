"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function FeaturePanel({ item, mobile = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${
        mobile ? "h-[470px]" : "h-[600px]"
      }`}
    >
      <Image
        src={item.img}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 25vw"
        priority
      />

      {/* TEKS DI ATAS */}
      <div className="absolute left-0 right-0 top-0 p-5 md:p-5">
        <h3 className="text-white text-xl md:text-[22px] font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] mt-3">
          {item.title}
        </h3>
        <p className="mt-2 max-w-[50ch] md:max-w-[36ch] text-white/90 text-sm md:text-[15px] leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
          {item.body}
        </p>
      </div>
    </div>
  );
}

export default function DnaFeatures() {
  const t = useTranslations("dnaFeatures");

  const items = [
    {
      img: "/images/konsultasi-pages/Frame-1.webp",
      title: t("items.report.title"),
      body: t("items.report.body"),
    },
    {
      img: "/images/konsultasi-pages/Frame-2.webp",
      title: t("items.library.title"),
      body: t("items.library.body"),
    },
    {
      img: "/images/konsultasi-pages/Frame-3.webp",
      title: t("items.article.title"),
      body: t("items.article.body"),
    },
    {
      img: "/images/konsultasi-pages/Frame-4.webp",
      title: t("items.consult.title"),
      body: t("items.consult.body"),
    },
  ];

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-5 text-center text-slate-600">
          {t("subheading")}
        </p>

        {/* Mobile: 1 slide per layar */}
        <div className="mt-8 md:hidden">
          <Swiper
            className="dna-swiper"
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={16}
            pagination={{ clickable: true }}
          >
            {items.map((it, i) => (
              <SwiperSlide key={i}>
                <FeaturePanel item={it} mobile />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: grid 4 */}
        <div className="mt-10 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4">
          {items.map((it, i) => (
            <FeaturePanel key={i} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
