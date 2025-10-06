"use client";

import React from "react";
import CorporateHealthTable from "./CorporateHealthTable";

export default function CorporateHealthArticlesPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Corporate Health Articles Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten Corporate Health Page.
      </p>

      <div className="mt-6">
        <CorporateHealthTable />
      </div>
    </div>
  );
}
