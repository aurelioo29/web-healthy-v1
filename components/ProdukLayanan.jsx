"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
// ✨ framer-motion untuk animasi
import { motion, useReducedMotion } from "framer-motion";

export default function ProdukLayanan() {
  const t = useTranslations("produkLayanan");
  const reduce = useReducedMotion();

  const keys = ["card1", "card2", "card3", "card4"];
  const cards = keys.map((k) => ({
    title: t(`card.${k}.title`),
    desc: t(`card.${k}.desc`),
    img: t(`card.${k}.img`),
    alt: t(`card.${k}.altImg`),
    href: t(`card.${k}.href`),
  }));

  // Variants untuk stagger pada grid desktop
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      {/* Heading (fade + slide-up) */}
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-2xl font-bold md:text-3xl">{t("title")}</h2>
        <p className="mt-6 md:text-md text-[#667289]">{t("description")}</p>
      </motion.div>

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
              {/* tiap kartu animasi masuk saat terlihat */}
              <MotionCard {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP: grid (stagger) */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="mt-16 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-4"
      >
        {cards.map((c, i) => (
          <MotionCard key={i} {...c} />
        ))}
      </motion.div>
    </section>
  );
}

/* ------------ Card dengan animasi ------------ */
function MotionCard({ title, desc, img, alt, href }) {
  const reduce = useReducedMotion();

  const item = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.5, ease: [0.2, 0, 0, 1] },
    },
  };

  return (
    <motion.article
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-[1px] transition-shadow hover:shadow-lg"
    >
      {/* glow halus saat hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4698E3]/8 to-transparent" />
      </div>

      <div className="relative aspect-video md:aspect-[2/2] w-full">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(max-width:768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          priority={false}
        />
      </div>

      <div className="p-4 text-center mt-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#667289]">{desc}</p>

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35 }}
          className="mt-5"
        >
          <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={href}
              className="inline-block rounded-xl bg-[#4698E3] px-4 py-2 text-sm font-medium text-white"
            >
              Lihat Selengkapnya
            </Link>
          </motion.span>
        </motion.div>
      </div>
    </motion.article>
  );
}
