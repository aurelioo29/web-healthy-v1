"use client";

import BannerHero from "@/components/BannerHero";
import EventPromo from "@/components/EventPromo";
import ProdukLayanan from "@/components/ProdukLayanan";
import StatsGrid from "@/components/StatsGrid";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div>
      <BannerHero />

      <StatsGrid />

      <ProdukLayanan />

      <EventPromo />

      {/* <h1>{t("title")}</h1> */}
    </div>
  );
}
