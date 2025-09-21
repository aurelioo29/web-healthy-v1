"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DNAandMe() {
  const t = useTranslations("dnaandme");

  return (
    <section className="py-12 md:py-16" id="selengkapnya">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
        {/* Ilustrasi (atas di mobile, kiri di desktop) */}
        <div className="order-1 md:order-none">
          <div className="relative mx-auto aspect-[4/3] w-full md:aspect-[5/4]">
            <Image
              src="/images/konsultasi-pages/ilustration.webp"
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Card teks + badge + tombol store */}
        <div className="relative order-1">
          {/* Badge judul (desktop) */}
          <span className="pointer-events-none absolute -top-13 right-10 hidden rounded-lg bg-[#4698E3] px-8 py-4 text-3xl font-semibold text-white shadow-md md:inline-block">
            {t("title")}
          </span>

          {/* Badge judul (mobile) */}
          <div className="mb-4 grid text-center md:hidden w-full">
            <span className="rounded-lg bg-[#4698E3] px-5 py-2 text-2xl font-semibold text-white shadow-md ">
              {t("title")}
            </span>
          </div>

          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 md:p-8">
            {/* Teks – center di mobile, tengah kiri di desktop */}
            <p className="mx-auto max-w-xl text-center text-slate-700 md:text-left">
              {t("body")}
            </p>

            {/* Tombol store */}
            <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
              <Link href={t("playUrl")} target="_blank" rel="noopener">
                <Image
                  src="/images/konsultasi-pages/playstore.webp"
                  alt={t("playAlt")}
                  width={200}
                  height={60}
                  className="h-auto w-[190px]"
                  priority
                />
              </Link>
              <Link href={t("appUrl")} target="_blank" rel="noopener">
                <Image
                  src="/images/konsultasi-pages/appstore.webp"
                  alt={t("appAlt")}
                  width={190}
                  height={60}
                  className="h-auto w-[180px]"
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
