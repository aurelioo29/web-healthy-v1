"use client";

import CategoryCatalogsTable from "./CategoryCatalogTable";

export default function CategoryCatalogsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          Catalog Categories
        </h1>
        <p className="text-slate-600">Kelola kategori untuk katalog.</p>
      </div>

      <CategoryCatalogsTable />
    </main>
  );
}
