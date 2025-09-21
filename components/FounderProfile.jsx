"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function FounderProfile() {
  const t = useTranslations("profile");

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-5">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* Kiri: gambar */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
          <div className="relative w-full aspect-[4/5] md:aspect-[2/2]">
            <Image
              src="/images/about-pages/founder-profile.webp"
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="bg-white object-contain md:object-cover md:object-center"
              priority={false}
            />
          </div>
        </div>

        {/* Kanan: teks */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
          <p className="mt-4 leading-relaxed text-slate-800 italic text-justify">
            "{t("description")}"
          </p>
        </div>
      </div>
    </section>
  );
}
