"use client";
import LabTestsTable from "./LabTestsTable";

export default function AdminLabTestsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
      <h1 className="text-2xl font-bold">Lab Test Laboratorium</h1>
      <p className="text-slate-600">
        Membuat dan mengelola kategori lab test yang dapat dipilih saat membuat
        lab test Laboratorium.
      </p>
      <div className="mt-6">
        <LabTestsTable />
      </div>
    </div>
  );
}
