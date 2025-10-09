"use client";

import React from "react";
import ProdukLayananTable from "./ProdukLayananTable";

export default function DashboardProdukLayananPage() {
  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1 className="text-2xl font-semibold text-slate-900">
        Produk & Layanan Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Kelola daftar produk & layanan untuk ditampilkan di situs
      </p>

      <div className="mt-6">
        <ProdukLayananTable />
      </div>
    </div>
  );
}
