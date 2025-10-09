"use client";

import React from "react";
import HomeCardTable from "./HomeCardTable";

export default function EventPromoPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Home Card Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang home card.
      </p>

      <div className="mt-6">
        <HomeCardTable />
      </div>
    </div>
  );
}
