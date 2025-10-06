import CoorporateHero from "@/components/CooporataHero";
import CorporateHealth from "@/components/CorporateHealth";
import React from "react";

export default function CorporateHealthServicePage() {
  return (
    <>
      <CoorporateHero />
      <CorporateHealth tNs="vitamin" />
    </>
  );
}
