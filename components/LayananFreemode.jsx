"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import "swiper/css";

export default function LayananFreemode() {
  const t = useTranslations("layanan");

  const keys = ["card1", "card2", "card3", "card4", "card5"];

  // helper aman: coba key, kalau missing jangan error
  const safeT = (key) => {
    try {
      return t(key);
    } catch {
      return undefined;
    }
  };

  const cards = keys.map((k) => {
    const base = `card.${k}`;
    const desc = safeT(`${base}.desc`) ?? safeT(`${base}.description`) ?? "";

    return {
      title: safeT(`${base}.title`) ?? "",
      desc,
      img: safeT(`${base}.img`) ?? "",
      alt: safeT(`${base}.altImg`) ?? "",
      href: safeT(`${base}.href`) ?? "#",
      price: safeT(`${base}.price`) ?? "",
      disc: safeT(`${base}.disc`) ?? "",
    };
  });

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-4 text-[#667289]">{t("description")}</p>
      </div>

      <div className="mt-8">
        <Swiper
          modules={[FreeMode, A11y]}
          a11y={{ enabled: true }}
          freeMode={{ enabled: true, momentumBounce: false }}
          grabCursor
          slidesPerView="auto"
          spaceBetween={16}
          className="!pb-2"
        >
          {cards.map((c, i) => (
            <SwiperSlide
              key={i}
              className="!w-[280px] sm:!w-[300px] md:!w-[340px] lg:!w-[360px]"
            >
              <Card {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Card({ title, desc, img, alt, href, price, disc }) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg flex flex-col">
      {/* Gambar fix 1:1 */}
      <div className="relative aspect-square w-full">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover"
        />
      </div>

      {/* Body fleksibel: isi tumbuh, CTA nempel bawah */}
      <div className="flex grow flex-col p-4">
        {/* TITLE: clamp 2 baris + tinggi konstan */}
        <h3 className="text-base md:text-lg font-semibold text-center leading-6 line-clamp-2 min-h-[48px]">
          {title}
        </h3>

        {/* DESC: clamp 3 baris + tinggi konstan (3*24px = 72px) */}
        <p className="my-2 text-sm text-[#667289] text-justify leading-6 line-clamp-3 min-h-[72px]">
          {desc}
        </p>

        {/* PRICE AREA: selalu ada, tapi pakai placeholder invisible agar tinggi sama */}
        <div className="my-5 flex items-baseline justify-center gap-2 min-h-[24px]">
          {disc ? (
            <span className="text-sm text-red-500 line-through">{disc}</span>
          ) : (
            <span className="invisible text-sm">placeholder</span>
          )}
          {price ? (
            <span className="font-semibold text-slate-900">{price}</span>
          ) : (
            <span className="invisible font-semibold">placeholder</span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="mt-auto inline-flex w-full items-center justify-center rounded-xl
                     bg-[#4698E3] px-4 py-2 text-sm font-medium text-white
                     transition hover:bg-[#4698E3]"
        >
          Lihat Produk
        </Link>
      </div>
    </article>
  );
}
