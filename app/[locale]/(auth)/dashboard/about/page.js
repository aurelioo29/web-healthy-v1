"use client";

import React from "react";
import AboutTable from "./AboutTable";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        About Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang perusahaan.
      </p>

      <div className="mt-6">
        <AboutTable />
      </div>
    </div>
  );
}
