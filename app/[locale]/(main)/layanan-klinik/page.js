import LayananHero from "@/components/LayananHero";
import React from "react";
import LayananKlinik from "@/components/LayananKlinik";

export default function LayananKlinikPage() {
  return (
    <>
      <LayananHero />
      <LayananKlinik tNs="vitamin" />
    </>
  );
}
