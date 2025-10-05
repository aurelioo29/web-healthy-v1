import About from "@/components/About";
import AboutHero from "@/components/AboutHero";
import FounderProfile from "@/components/FounderProfile";
import GaleriKomitmen from "@/components/GaleriKomitmen";
import Sertifikat from "@/components/Sertifikat";
import Value from "@/components/Value";
import React from "react";

export default function TentangKamiPages() {
  return (
    <>
      <AboutHero />
      <About />
      <Sertifikat />
      <GaleriKomitmen />
      {/* />
      <Value />
      <FounderProfile /> */}
    </>
  );
}
