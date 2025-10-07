"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

function BenefitCard({ icon, title, desc }) {
  return (
    <div className="h-full rounded-2xl p-5 text-center md:border md:border-slate-200 md:bg-white md:shadow-sm">
      <div className="mx-auto mb-4 grid h-16 w-16 place-content-center rounded-xl bg-[#4698E3]/10">
        <Image src={icon} alt="" width={44} height={44} className="mx-auto" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 md:block">
        {desc}
      </p>
    </div>
  );
}

export default function HomecareBenefit() {
  const t = useTranslations("homecareBenefit");

  const cards = ["card1", "card2", "card3", "card4", "card5"].map((key) => ({
    icon: t(`cards.${key}.icon`),
    title: t(`cards.${key}.title`),
    desc: t(`cards.${key}.desc`),
  }));

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-2 md:px-6">
        {/* kiri */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-[28px]">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">{t("body")}</p>

          <div className="mt-6">
            <Link
              href={t("ctaHref")}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white shadow-sm transition hover:bg-[#3b86cf]"
            >
              {t("cta")}
            </Link>
          </div>
        </div>

        {/* desktop: grid (biarkan) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-6">
            {cards.map((c, i) => (
              <BenefitCard key={i} {...c} />
            ))}
          </div>
        </div>

        {/* mobile: grid 2 kolom */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {cards.map((c, i) => (
              <BenefitCard key={i} {...c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
