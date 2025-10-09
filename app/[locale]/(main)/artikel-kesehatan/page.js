import ArtikelCard from "@/components/ArtikelCard";
import ArtikelLatest from "@/components/ArtikelLatest";
import HeroSectionClient from "@/components/HeroSectionClient";
import React from "react";

export default function ArtikelKesehatanPage() {
  return (
    <>
      <HeroSectionClient pageKey="articles" />
      <ArtikelLatest />
      <ArtikelCard />
    </>
  );
}
