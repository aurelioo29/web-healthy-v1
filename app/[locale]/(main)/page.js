"use client";

import BannerHero from "@/components/BannerHero";
import EventPromo from "@/components/EventPromo";
import LayananFreemode from "@/components/LayananFreemode";
import ProdukLayanan from "@/components/ProdukLayanan";
import StatsGrid from "@/components/StatsGrid";
import TestimoniVideo from "@/components/TestimoniVideo";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div>
      <BannerHero />

      <StatsGrid />

      <ProdukLayanan />

      <EventPromo />

      <LayananFreemode />

      <TestimoniVideo />

      {/* <h1>{t("title")}</h1> */}
    </div>
  );
}
