"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations("about");

  return (
    <section
      id="about-section"
      className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16"
    >
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* Kiri: teks */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>

          {/* kalau butuh <br/> di tengah kalimat, pakai t.rich */}
          <p className="mt-4 leading-relaxed text-slate-800 text-justify">
            {t("body")}
          </p>

          <p className="mt-6 font-semibold text-slate-900">{t("quote")}</p>
        </div>

        {/* Kanan: gambar */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
          <div className="relative w-full h-[450px] sm:h-[340px] md:h-[440px] lg:h-[520px]">
            <Image
              src="/images/about-pages/about.webp"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
