"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AboutHero() {
  const t = useTranslations("aboutHero"); // namespace

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
      <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
        {/* BG warna dulu, nanti mau ganti foto tinggal swap */}
        <div className="relative w-full bg-[#E9F3FF]">
          {/* dekor opsional, buang kalau ilfeel */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/50 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-0 h-[120%] w-1/2 bg-gradient-to-t from-white/30 to-transparent"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[520px]">
            {/* TEKS kiri, vertikal tengah */}
            <div className="lg:col-span-6 flex items-center">
              <div className="px-6 py-10 md:px-10 lg:px-12 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {t("title")}
                </h2>

                <p className="mt-4 leading-relaxed text-slate-800">
                  {t("body")}
                </p>

                {/* Tombol ke AboutSection di halaman yang sama */}
                <Link
                  href="#selengkapnya"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#4698E3] px-5 py-2.5 text-white font-medium hover:bg-[#4698E3]/80 transition"
                >
                  {t("cta")}
                </Link>
              </div>
            </div>

            {/* Kolom kanan kosong buat komposisi (atau nanti taruh foto) */}
            <div className="hidden lg:block lg:col-span-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
