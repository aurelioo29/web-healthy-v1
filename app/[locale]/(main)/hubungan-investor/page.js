import HeroSectionClient from "@/components/HeroSectionClient";
import InvestorCard from "@/components/InvestorCard";
import React from "react";

export default function HubunganInvestorPage() {
  return (
    <div>
      <HeroSectionClient pageKey="investor_relations" />
      <InvestorCard />
    </div>
  );
}
