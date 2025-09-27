import ArtikelCard from "@/components/ArtikelCard";
import ArtikelHero from "@/components/ArtikelHero";
import ArtikelLatest from "@/components/ArtikelLatest";
import React from "react";

export default function ArtikelKesehatanPage() {
  return (
    <>
      <ArtikelHero />
      <ArtikelLatest />
      <ArtikelCard />
    </>
  );
}
