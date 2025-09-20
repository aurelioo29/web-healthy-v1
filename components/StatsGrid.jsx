"use client";

import React from "react";
import { useTranslations } from "next-intl";
import FlipStatsCard from "./FlipStatsCard";

export default function StatsGrid() {
  const t = useTranslations("stats");

  const order = ["partners", "exams", "customers", "company"];

  const items = order.map((key) => ({
    icon: t(`cards.${key}.icon`),
    value: t(`cards.${key}.value`),
    label: t(`cards.${key}.label`),
    cta: {
      title: t(`cta.${key}.title`),
      desc: t(`cta.${key}.desc`),
      cta: t(`cta.${key}.cta`),
      href: t(`cta.${key}.href`),
    },
  }));

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <FlipStatsCard key={order[i]} {...it} />
      ))}
    </section>
  );
}
