import CabangDiagnosSection from "@/components/CabangDiagnosSection";
import ContactSection from "@/components/ContactSection";
import HeroSectionClient from "@/components/HeroSectionClient";
import React from "react";

export default function LokasiKlinikPage() {
  return (
    <>
      <HeroSectionClient pageKey="location" />
      <CabangDiagnosSection />
      <ContactSection />
    </>
  );
}
