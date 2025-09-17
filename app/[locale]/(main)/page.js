"use client";

import EventPromo from "@/components/EventPromo";
import ProdukLayanan from "@/components/ProdukLayanan";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div>
      <Image
        src="/images/home-pages/banner-hero.webp"
        alt="banner"
        width={1280}
        height={525}
        className="rounded-2xl mx-auto my-10"
      />

      <ProdukLayanan />

      <EventPromo />

      {/* <h1>{t("title")}</h1> */}
    </div>
  );
}
