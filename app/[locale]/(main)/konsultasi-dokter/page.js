import AppPromo from "@/components/AppPromo";
import Benefit from "@/components/Benefit";
import DNAandMe from "@/components/DNAandMe";
import DnaFeatures from "@/components/DnaFeatures";
import DoctorsSection from "@/components/DoctorSection";
import KonsultasiHero from "@/components/KonsultasiHero";
import React from "react";

export default function KonsultasiDokterPage() {
  return (
    <>
      <KonsultasiHero />
      <DoctorsSection />
      <DNAandMe />
      <DnaFeatures />
      <Benefit />
      <AppPromo />
    </>
  );
}
