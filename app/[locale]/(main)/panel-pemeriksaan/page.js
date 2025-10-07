import PanelPemeriksaanCard from "@/components/PanelPemeriksaanCard";
import PemeriksaanHero from "@/components/PemeriksaanHero";
import PemeriksaanPaket from "@/components/PemeriksaanPaket";
import React from "react";

export default function PanelPemeriksaanPage() {
  return (
    <>
      <PemeriksaanHero />
      <PemeriksaanPaket />
      <PanelPemeriksaanCard />
    </>
  );
}
