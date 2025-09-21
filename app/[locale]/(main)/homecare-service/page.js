import HomecareBenefit from "@/components/HomecareBenefit";
import HomecareCall from "@/components/HomecareCall";
import HomecareHero from "@/components/HomecareHero";
import HomecareInfo from "@/components/HomecareInfo";
import React from "react";

export default function HomecareServicePages() {
  return (
    <>
      <HomecareHero />
      <HomecareInfo />
      <HomecareBenefit />
      <HomecareCall />
    </>
  );
}
