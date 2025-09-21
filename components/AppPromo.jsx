"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AppPromo() {
  const t = useTranslations("appPromo");

  return (
    <section className="relative overflow-hidden my-10">
      {/* background */}
      <div className="absolute inset-0 bg-[#4698E3]" aria-hidden />
      <Image
        src="/images/konsultasi-pages/situation.webp"
        alt=""
        fill
        priority
        className="pointer-events-none select-none object-cover opacity-30 mix-blend-overlay"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2 md:gap-16 md:px-6">
        {/* Text – mobile: first + centered */}
        <div className="text-white text-center md:text-left">
          <h2 className="text-3xl font-semibold leading-snug md:text-4xl">
            {t.rich("title", {
              strong: (chunks) => <span className="text-white">{chunks}</span>,
            })}
          </h2>

          <p className="mt-5 mx-auto max-w-xl text-base leading-relaxed text-white/90 md:mx-0 md:text-lg">
            {t("body")}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <Link href={t("playUrl")} target="_blank" rel="noopener">
              <Image
                src="/images/konsultasi-pages/playstore.webp"
                alt={t("playAlt")}
                width={180}
                height={54}
                className="h-auto w-[180px]"
                priority
              />
            </Link>
            <Link href={t("appUrl")} target="_blank" rel="noopener">
              <Image
                src="/images/konsultasi-pages/appstore.webp"
                alt={t("appAlt")}
                width={170}
                height={54}
                className="h-auto w-[180px]"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Visual – mobile: second + centered */}
        <div className="order-2 md:order-none relative mx-auto w-full max-w-[560px] aspect-[3/4] sm:aspect-[16/10] md:max-w-none md:aspect-[12/12] -bottom-8">
          <Image
            src="/images/konsultasi-pages/situation.webp"
            alt={t("imageAlt")}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
