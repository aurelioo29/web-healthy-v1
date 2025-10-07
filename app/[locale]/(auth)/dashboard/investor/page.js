"use client";

import InvestorsTable from "./InvestorTable";

export default function InvestorCategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          Investor Management
        </h1>
        <p className="text-slate-600">Kelola content untuk investor.</p>
      </div>

      <InvestorsTable />
    </main>
  );
}
