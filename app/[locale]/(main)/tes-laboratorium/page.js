import HeroSectionClient from "@/components/HeroSectionClient";
import TesLaboratoriumCard from "@/components/TesLaboratoriumCard";
import React from "react";

export default function TesLaboratoriumPage() {
  return (
    <>
      <HeroSectionClient pageKey="lab_tests" />
      <TesLaboratoriumCard />
    </>
  );
}
