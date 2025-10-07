"use client";

import Image from "next/image";
import Link from "next/link";

export default function CategoryHero({
  title,
  description = "",
  iconSrc,
  bgSrc = "/images/tes-lab-pages/Hero-Detail.webp",
  ctaHref = "#selengkapnya",
  ctaText = "Lihat Selengkapnya",
}) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl md:px-6">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
          {/* BG */}
          <Image
            src={bgSrc}
            alt="Hero background"
            fill
            priority
            sizes="(min-width:1024px) 1100px, 100vw"
            className="object-cover object-center"
          />

          {/* Konten overlay */}
          <div className="relative h-[320px] md:h-[420px] lg:h-[480px]">
            <div className="h-full grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Icon */}
              {iconSrc ? (
                <div className="mx-auto lg:mx-0 lg:col-span-3 lg:pl-10">
                  <div className="relative h-28 w-28 md:h-32 md:w-32 lg:h-56 lg:w-56">
                    <Image
                      src={iconSrc}
                      alt={title}
                      fill
                      sizes="160px"
                      className="object-contain drop-shadow"
                    />
                  </div>
                </div>
              ) : null}

              {/* Teks */}
              <div
                className={`px-6 md:px-10 ${
                  iconSrc ? "lg:col-span-8" : "lg:col-span-12"
                } text-center lg:text-left`}
              >
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">
                  {title}
                </h1>

                {description ? (
                  <p className="mt-2 md:mt-3 md:text-lg text-slate-800">
                    {description}
                  </p>
                ) : null}

                <Link
                  href={ctaHref}
                  className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white font-semibold hover:bg-[#3b86cf] transition text-sm"
                >
                  {ctaText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
