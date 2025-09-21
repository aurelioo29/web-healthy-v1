import CoorporateHero from "@/components/CooporataHero";
import KlinikPerusahaan from "@/components/KlinikPerusahaan";
import LayananKorporasi from "@/components/LayananKorporasi";
import ManajemenLayanan from "@/components/ManajemenLayanan";
import MedicalCheck from "@/components/MedicalCheck";
import React from "react";

export default function CorporateHealthServicePage() {
  return (
    <>
      <CoorporateHero />
      <LayananKorporasi />
      <MedicalCheck />
      <ManajemenLayanan />
      <KlinikPerusahaan />
    </>
  );
}
