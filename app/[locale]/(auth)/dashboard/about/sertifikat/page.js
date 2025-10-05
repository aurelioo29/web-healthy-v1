"use client";

import React from "react";
import SertifikatTable from "./SertifikatTable";

export default function AboutSertifikatPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        About Sertifikat Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang perusahaan.
      </p>

      <div className="mt-6">
        <SertifikatTable />
      </div>
    </div>
  );
}
