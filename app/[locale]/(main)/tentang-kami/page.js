import About from "@/components/About";
import HeroSectionClient from "@/components/HeroSectionClient";
import FounderProfile from "@/components/FounderProfile";
import GaleriKomitmen from "@/components/GaleriKomitmen";
import Sertifikat from "@/components/Sertifikat";
import Value from "@/components/Value";
import React from "react";

export default function TentangKamiPages() {
  return (
    <>
      <HeroSectionClient pageKey="about" />
      <About />
      <FounderProfile />
      <Sertifikat />
      <GaleriKomitmen />
      {/* />
      <Value />
      <FounderProfile /> */}
    </>
  );
}
