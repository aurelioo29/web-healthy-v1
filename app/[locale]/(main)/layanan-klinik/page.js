import LayananHero from "@/components/LayananHero";
import PersonalCheck from "@/components/PersonalCheck";
import TesLaboratorium from "@/components/TesLaboratorium";
import VaccineSection from "@/components/VaccineSection";
import VitaminSection from "@/components/VitaminSection";
import React from "react";

export default function LayananKlinikPage() {
  return (
    <>
      <LayananHero />
      <VaccineSection />
      <VitaminSection />
      <PersonalCheck />
      <TesLaboratorium />
    </>
  );
}
