"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LabServiceTypes() {
  const t = useTranslations("labTypes");

  return (
    <section className="py-12 md:py-20" id="selengkapnya">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
        {/* Kiri: Teks */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-10 text-slate-600 leading-relaxed md:text-md text-justify">
            {t.rich("body", {
              strong: (chunks) => (
                <span className="font-semibold text-[#667085]">{chunks}</span>
              ),
            })}
          </p>
        </div>

        {/* Kanan: Gambar */}
        <div className="relative">
          <div
            className="absolute -inset-3 rounded-3xl bg-[#4698E3]/15 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
            <Image
              src="/images/manajemen-pages/jenis.webp"
              alt={t("imageAlt")}
              width={1200}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
