"use client";

import React from "react";
import AboutUsPresidentTable from "./AboutUsPresidentTable";

export default function AboutPresidentPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        About the President
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Membuat dan mengelola konten tentang President.
      </p>

      <div className="mt-6">
        <AboutUsPresidentTable />
      </div>
    </div>
  );
}
