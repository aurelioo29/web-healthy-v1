"use client";

import InvestorCategoriesTable from "./InvestorCategoryTable";

export default function InvestorCategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          Investor Categories Management
        </h1>
        <p className="text-slate-600">Kelola kategori untuk investor.</p>
      </div>

      <InvestorCategoriesTable />
    </main>
  );
}
