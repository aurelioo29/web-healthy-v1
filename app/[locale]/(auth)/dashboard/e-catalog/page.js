"use client";

import CatalogsTable from "./CatalogsTable";

export default function CatalogsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">Catalog</h1>
        <p className="text-slate-600">Kelola daftar katalog layanan/produk.</p>
      </div>

      <CatalogsTable />
    </main>
  );
}
