"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";

export default function ProdukLayanan() {
  const t = useTranslations("produkLayanan");

  const keys = ["card1", "card2", "card3", "card4"];
  const cards = keys.map((k) => ({
    title: t(`card.${k}.title`),
    desc: t(`card.${k}.desc`),
    img: t(`card.${k}.img`),
    alt: t(`card.${k}.altImg`),
    href: t(`card.${k}.href`),
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{t("title")}</h2>
        <p className="mt-6 md:text-md text-[#667289]">{t("description")}</p>
      </div>

      {/* MOBILE: swiper */}
      <div className="mt-8 md:hidden">
        <Swiper
          modules={[Pagination, A11y]}
          slidesPerView={1}
          centeredSlides={false}
          spaceBetween={16}
          pagination={{ clickable: true }}
          navigation={false}
          a11y={{ enabled: true }}
          className="produk-swiper !pb-10"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "6px",
            "--swiper-pagination-color": "#4698E3",
            "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
          breakpoints={{
            480: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
          }}
        >
          {cards.map((c, i) => (
            <SwiperSlide key={i}>
              <Card {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP: grid */}
      <div className="mt-16 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={i} {...c} />
        ))}
      </div>
    </section>
  );
}

function Card({ title, desc, img, alt, href }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200 transition hover:shadow-lg">
      <div className="relative aspect-video md:aspect-[2/2] w-full">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(max-width:768px) 100vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          priority={false}
        />
      </div>
      <div className="p-4 text-center mt-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#667289]">{desc}</p>
        <Link
          href={href}
          className="mt-5 text-white bg-[#4698E3] w-full mx-auto rounded-xl px-4 py-2 text-sm font-medium text-center transition inline-block"
        >
          Lihat Selengkapnya
        </Link>
      </div>
    </article>
  );
}
