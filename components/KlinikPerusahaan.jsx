"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function KlinikPerusahaan() {
  const t = useTranslations("klinikPerusahaan");

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 md:grid-cols-2 md:gap-8 md:px-6">
        <div className="relative order-3 md:order-1 my-auto md:left-28 md:top-10 z-10">
          {/* DESKTOP: pill judul mengambang */}
          <div className="pointer-events-none absolute -top-7 left-8 z-10 hidden md:block max-w-sm">
            <span className="inline-block rounded-lg bg-gradient-to-r from-[#63b3f2] to-[#4698E3] px-5 py-2 text-2xl font-semibold text-white shadow-lg">
              {t("title")}
            </span>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 md:p-8">
            {/* padding top hanya untuk desktop (ruang pill) */}
            <p className="pt-0 text-justify leading-relaxed text-slate-700 md:pt-10">
              {t("body")}
            </p>

            <div className="mt-16">
              <Link
                href={t("ctaHref")}
                className="inline-flex items-center justify-center rounded-lg bg-[#4698E3] px-5 py-2.5 text-white transition hover:bg-[#3b86cf]"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>

        <div className="md:hidden order-2">
          <div className="w-full rounded-xl bg-gradient-to-r from-[#63b3f2] to-[#4698E3] py-3 text-center font-semibold text-white shadow-lg">
            {t("title")}
          </div>
        </div>

        <div className="relative order-1 md:order-1">
          <div
            className="absolute -inset-3 rounded-3xl bg-[#4698E3]/15 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
            <Image
              src="/images/corporate-pages/klinik-perusahaan.webp"
              alt={t("imageAlt")}
              width={1280}
              height={860}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
