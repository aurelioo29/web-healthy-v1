import AppPromo from "@/components/AppPromo";
import Benefit from "@/components/Benefit";
import DNAandMe from "@/components/DNAandMe";
import DnaFeatures from "@/components/DnaFeatures";
import DoctorsSection from "@/components/DoctorSection";
import HeroSectionClient from "@/components/HeroSectionClient";
import React from "react";

export default function KonsultasiDokterPage() {
  return (
    <>
      <HeroSectionClient pageKey="consultation" />
      <DoctorsSection />
      <DNAandMe />
      <DnaFeatures />
      <Benefit />
      <AppPromo />
    </>
  );
}
