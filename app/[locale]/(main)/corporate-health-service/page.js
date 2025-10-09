import CorporateHealth from "@/components/CorporateHealth";
import HeroSectionClient from "@/components/HeroSectionClient";
import React from "react";

export default function CorporateHealthServicePage() {
  return (
    <>
      <HeroSectionClient pageKey="corporate_health_service" />
      <CorporateHealth tNs="vitamin" />
    </>
  );
}
