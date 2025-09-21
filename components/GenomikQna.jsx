"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function GenomikQna() {
  const t = useTranslations("genomikQna");

  return (
    <section className="py-12 md:py-16" id="selengkapnya">
      <div className="mx-auto grid max-w-7xl items-start gap-6 px-4 md:grid-cols-2 md:gap-8 md:px-6">
        <div className="relative md:order-1">
          <div
            className="absolute -inset-3 rounded-3xl bg-[#4698E3]/15 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
            <Image
              src="/images/pemeriksaan-pages/paket-pemeriksaan.webp"
              alt={t("imageAlt")}
              width={1280}
              height={860}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="md:hidden md:order-2">
          <div className="w-full rounded-xl bg-gradient-to-r from-[#63b3f2] to-[#4698E3] py-3 text-center font-semibold text-white shadow-lg">
            {t("title")}
          </div>
        </div>

        <div className="relative md:order-2 my-auto md:right-20 md:top-9">
          {/* DESKTOP: pill judul mengambang */}
          <div className="pointer-events-none absolute -top-7 right-8 z-10 hidden md:block">
            <span className="inline-block rounded-lg bg-gradient-to-r from-[#63b3f2] to-[#4698E3] px-5 py-2 text-3xl font-semibold text-white shadow-lg">
              {t("title")}
            </span>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 md:p-8">
            <ol className="mt-6 list-disc space-y-1 pl-5 text-slate-900">
              <li>{t("items.0")}</li>
              <li>{t("items.1")}</li>
              <li>{t("items.2")}</li>
              <li>{t("items.3")}</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
