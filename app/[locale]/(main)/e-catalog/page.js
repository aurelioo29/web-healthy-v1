import CatalogUserPage from "@/components/CatalogUserPage";
import React from "react";
import HeroSectionClient from "@/components/HeroSectionClient";

export default function ECatalogPage() {
  return (
    <div>
      <HeroSectionClient pageKey="e_catalog" />
      <CatalogUserPage />
    </div>
  );
}
