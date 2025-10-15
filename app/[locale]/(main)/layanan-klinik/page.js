import React from "react";
import LayananKlinik from "@/components/LayananKlinik";
import HeroSectionClient from "@/components/HeroSectionClient";

export default function LayananKlinikPage() {
  return (
    <>
      <HeroSectionClient pageKey="clinic_services" />
      <LayananKlinik tNs="vitamin" />
    </>
  );
}
