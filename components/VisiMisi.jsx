"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function VisiMisi() {
  const t = useTranslations("visiMisi");

  const pointKeys = ["point1", "point2", "point3"];
  const points = pointKeys
    .map((k) => {
      try {
        return t(`misi.body.${k}`);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* Kiri: gambar */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
          <div className="relative w-full h-[450px] sm:h-[340px] md:h-[440px] lg:h-[520px]">
            <Image
              src="/images/about-pages/visi-misi.webp"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
          </div>
        </div>

        {/* Kanan: teks */}
        <div className="mx-auto max-w-3xl">
          {/* VISI */}
          <h2 className="text-2xl md:text-3xl font-bold">{t("visi.title")}</h2>
          <p className="mt-4 leading-relaxed text-slate-800">
            {t("visi.body")}
          </p>

          {/* separator tipis, biar napas */}
          <div className="my-8 border-b border-slate-200" />

          {/* MISI */}
          <h3 className="text-2xl md:text-3xl font-bold">{t("misi.title")}</h3>
          <ol className="mt-4 list-decimal pl-6 space-y-2 text-slate-800 leading-relaxed">
            {points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
