"use client";
import CategoryLabTestsTable from "./CategoryLabTestsTable";

export default function AdminLabTestCategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold">Lab Test Categories</h1>
      <p className="text-slate-600">Manage categories (with image)</p>
      <div className="mt-6">
        <CategoryLabTestsTable />
      </div>
    </div>
  );
}
