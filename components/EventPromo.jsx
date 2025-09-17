"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function EventPromo() {
  const t = useTranslations("eventPromo");
  const locale = useLocale();

  // Ambil slides dari messages (array of objects). Fallback: asset 1..7.
  const slidesFromMessages = t.raw?.("slides");
  const basePath = (t.raw && t.raw("basePath")) || "/images/home-pages";

  const fallback = Array.from({ length: 7 }, (_, i) => ({
    img: `${basePath}/asset-${i + 1}.jpeg`,
    alt: t("defaultAlt", { index: i + 1 }),
  }));

  const slides = Array.isArray(slidesFromMessages)
    ? slidesFromMessages
    : fallback;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-5 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold">{t("title")}</h2>
        <p className="mt-1 md:text-lg">{t("subtitle")}</p>
      </div>

      <Swiper
        modules={[Pagination, Autoplay, A11y, Keyboard]}
        slidesPerView={1}
        spaceBetween={16}
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        className="overflow-hidden rounded-3xl shadow ring-1 ring-black/5"
      >
        {slides.map((s, idx) => {
          const content = (
            <div className="relative w-full aspect-[16/7] md:aspect-[7/4]">
              <Image
                src={encodeURI(s.img)}
                alt={s.alt || t("defaultAlt", { index: idx + 1 })}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          );

          return (
            <SwiperSlide key={s.img || idx}>
              {s.href ? (
                <Link
                  href={s.href}
                  locale={locale}
                  aria-label={s.alt || `Promo ${idx + 1}`}
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
