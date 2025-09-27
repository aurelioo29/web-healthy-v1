import React from "react";
import CsrTable from "./CsrTable";

export default function DashboardCSRPage() {
  return (
    <div className="max-w-7xl mx-auto p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Corporate Social Responsibility (CSR) Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Atur semua Corporate Social Responsibility (CSR) postingan ada di
            sini.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CsrTable />
      </div>
    </div>
  );
}
