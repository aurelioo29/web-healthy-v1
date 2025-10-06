"use client";

import React from "react";
import KlinikTable from "./LokasiKlinikTable";

export default function LokasiKlinikPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Lokasi Klinik Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang lokasi klinik.
      </p>

      <div className="mt-6">
        <KlinikTable />
      </div>
    </div>
  );
}
