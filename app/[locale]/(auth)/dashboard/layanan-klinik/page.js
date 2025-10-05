"use client";

import React from "react";
import LayananKlinikTable from "./LayananKlinikTable";
// import AboutTable from "./AboutTable";

export default function LayananKlinik() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Layanan Klinik Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang layanan klinik.
      </p>

      <div className="mt-6">
        <LayananKlinikTable />
      </div>
    </div>
  );
}
