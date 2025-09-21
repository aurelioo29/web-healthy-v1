"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function GaleriKomitmen() {
  const t = useTranslations("komitmen");

  const keys = ["item1", "item2", "item3", "item4", "item5", "item6", "item7"];

  const safe = (k, fb = "") => {
    try {
      return t(k);
    } catch {
      return fb;
    }
  };

  const images = keys
    .map((k, i) => ({
      src: safe(`gallery.${k}.src`, `/images/galeri/${i + 1}.jpg`),
      alt: safe(`gallery.${k}.alt`, `Kegiatan ${i + 1}`),
    }))
    .filter((it) => !!it.src);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-4 text-[#667289]">{t("description")}</p>
      </div>

      <div className="mt-8">
        <Swiper
          modules={[FreeMode, Pagination, A11y]}
          a11y={{ enabled: true }}
          freeMode={{ enabled: true, momentumBounce: false }}
          slidesPerView="auto"
          spaceBetween={16}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="komitmen-swiper !pb-8"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
            "--swiper-pagination-color": "#4698E3",
            "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          {images.map((img, i) => (
            <SwiperSlide
              key={i}
              className="!w-[68%] xs:!w-[280px] sm:!w-[300px] md:!w-[320px] lg:!w-[340px]"
            >
              <figure className="overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white shadow-sm">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 80vw, 340px"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .komitmen-swiper .swiper-pagination-bullet {
          background: var(--swiper-pagination-bullet-inactive-color) !important;
          opacity: var(--swiper-pagination-bullet-inactive-opacity) !important;
        }
        .komitmen-swiper .swiper-pagination-bullet-active {
          background: var(--swiper-pagination-color) !important;
        }
      `}</style>
    </section>
  );
}
