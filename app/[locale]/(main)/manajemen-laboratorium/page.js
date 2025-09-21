import LabServicesGrid from "@/components/LabServicesGrid";
import LabServiceTypes from "@/components/LabServiceTypes";
import ManajemenHero from "@/components/ManajementHero";
import React from "react";

export default function ManajemenLaboratoriumPage() {
  return (
    <>
      <ManajemenHero />
      <LabServiceTypes />
      <LabServicesGrid />
    </>
  );
}
