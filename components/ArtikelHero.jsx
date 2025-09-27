"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ArtikelHero() {
  const t = useTranslations("artikelHero");

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        {/* === MOBILE ONLY: teks dulu, foto di bawah === */}
        <div className="md:hidden overflow-hidden rounded-3xl ring-1 ring-black/5 bg-white">
          <div className="px-6 py-8">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900">
              {t("title")}
            </h1>

            <p className="mt-4 text-slate-700">{t("body")}</p>
            <Link
              href={t("ctaHref")}
              className="mt-6 inline-flex items-center rounded-xl bg-[#4698E3] px-5 py-2.5 text-white font-semibold hover:bg-[#3b86cf] transition text-sm"
            >
              {t("cta")}
            </Link>
          </div>

          {/* Foto dipisah, no overlay */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={t("imageSrc")}
              alt={t("imageAlt")}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* === DESKTOP/TABLET ONLY: kode asli kamu, untouched === */}
        <div className="hidden md:block">
          <div className="relative overflow-hidden rounded-3xl md:rounded-2xl ring-1 ring-black/5">
            {/* Gambar (fill) */}
            <div className="relative h-[360px] md:h-[500px] lg:h-[560px]">
              <Image
                src={t("imageSrc")}
                alt={t("imageAlt")}
                fill
                priority
                sizes="(min-width:1024px) 1100px, 100vw"
                className="object-cover object-right"
              />

              {/* Konten: pusatkan penuh */}
              <div className="absolute inset-0 z-10 grid place-items-center px-6 md:px-10 lg:px-12">
                <div className="max-w-6xl text-center">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
                    {t.rich("title")}
                  </h1>

                  <p className="mt-8 md:text-base text-white">{t("body")}</p>

                  <div className="mt-20">
                    <Link
                      href={t("ctaHref")}
                      className="inline-flex items-center rounded-xl bg-[#4698E3] px-5 py-2.5 text-white font-semibold hover:bg-[#4698E3]/90 transition text-sm"
                    >
                      {t("cta")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
