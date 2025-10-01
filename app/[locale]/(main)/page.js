"use client";

import BannerHero from "@/components/BannerHero";
import BeritaHome from "@/components/BeritaHome";
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

      <BeritaHome />
    </div>
  );
}
