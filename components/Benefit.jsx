"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

function BenefitItem({ idx, title, body }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
      <div className="grid h-12 w-12 shrink-0 place-content-center rounded-md bg-[#4698E3] text-white font-semibold text-2xl">
        {idx}
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-slate-600 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function Benefit() {
  const t = useTranslations("benefit");

  const items = [
    { title: t("items.0.title"), body: t("items.0.body") },
    { title: t("items.1.title"), body: t("items.1.body") },
    { title: t("items.2.title"), body: t("items.2.body") },
    { title: t("items.3.title"), body: t("items.3.body") },
    { title: t("items.4.title"), body: t("items.4.body") },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">{t("heading")}</h2>
          <p className="mx-auto mt-8 text-slate-600">{t("subheading")}</p>
        </div>

        {/* Content */}
        <div className="mt-10 grid gap-8 md:grid-cols-2 items-start">
          {/* LEFT: list */}
          <div className="order-1 md:order-none space-y-4">
            {items.map((it, i) => (
              <BenefitItem
                key={i}
                idx={i + 1}
                title={it.title}
                body={it.body}
              />
            ))}
          </div>

          {/* RIGHT: illustration */}
          <div className="my-auto">
            <div className="relative">
              {/* aspect ratio container */}
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/konsultasi-pages/benefit.webp"
                  alt={t("imageAlt")}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
