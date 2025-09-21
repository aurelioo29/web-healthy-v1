"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LabServicesGrid() {
  const t = useTranslations("labServices");

  // Path ikon 1.svg s/d 14.svg
  const ICON_PATH = "/icons/manajemen-pages";
  const icons = Array.from(
    { length: 14 },
    (_, i) => `${ICON_PATH}/${i + 1}.svg`
  );

  // Ambil item dari i18n: items.0.title, items.0.body, dst.
  const items = Array.from({ length: 14 }, (_, i) => ({
    icon: icons[i],
    title: t(`items.${i}.title`),
    body: t(`items.${i}.body`),
  }));

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-4 text-center text-slate-600 md:text-lg">
          {t("subheading")}
        </p>

        <div className="mt-16 md:mt-28 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <article
              key={i}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-[#e6f0fb] p-3">
                <Image
                  src={it.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {it.title}
              </h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
