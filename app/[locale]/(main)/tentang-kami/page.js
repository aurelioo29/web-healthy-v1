import AboutHero from "@/components/AboutHero";
import AboutSection from "@/components/AboutSection";
import FounderProfile from "@/components/FounderProfile";
import GaleriKomitmen from "@/components/GaleriKomitmen";
import Sertifikat from "@/components/Sertifikat";
import Value from "@/components/Value";
import VisiMisi from "@/components/VisiMisi";
import React from "react";

export default function TentangKamiPages() {
  return (
    <>
      <AboutHero />
      <AboutSection />
      <VisiMisi />
      <Value />
      <FounderProfile />
      <Sertifikat />
      <GaleriKomitmen />
    </>
  );
}
