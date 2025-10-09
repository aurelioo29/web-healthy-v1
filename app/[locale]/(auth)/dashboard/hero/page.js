"use client";

import React from "react";
import HeroSectionTable from "./HeroSectionTable";

export default function DashboardHeroSectionPage() {
  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1 className="text-2xl font-semibold text-slate-900">
        Hero Section Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Kelola daftar hero section untuk ditampilkan di situs
      </p>

      <div className="mt-6">
        <HeroSectionTable />
      </div>
    </div>
  );
}
