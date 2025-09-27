"use client";

import React from "react";
import CategoryTable from "./CategoryTable";

export default function CategoryArticlesPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Category Articles Management
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola kategori artikel yang dapat dipilih saat membuat
        artikel.
      </p>

      <div className="mt-6">
        <CategoryTable />
      </div>
    </div>
  );
}
