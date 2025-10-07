import GenomikCatalogGrid from "@/components/GenomikCard";
import GenomikHero from "@/components/GenomikHero";
import GenomikQna from "@/components/GenomikQna";
import React from "react";

export default function GenomikPage() {
  return (
    <>
      <GenomikHero />
      <GenomikQna />
      <GenomikCatalogGrid />
    </>
  );
}
