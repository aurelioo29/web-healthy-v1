"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Swal from "sweetalert2";

const BRAND = "#4698E3";

const parseApiError = (error) => {
  const res = error?.response?.data;
  if (!res) return error?.message || "Submit failed";
  const { message, errors } = res;

  if (errors) {
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors))
      return errors
        .map((e) => e?.msg || e?.message || e)
        .filter(Boolean)
        .join("\n");
    if (typeof errors === "object") return Object.values(errors).join("\n");
  }
  return message || "Submit failed";
};

export default function InvestorCategoryFormModal({
  open,
  onClose,
  mode = "create", // "create" | "edit"
  initialData = null,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name || "");
    } else {
      setName("");
    }
  }, [open, initialData]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = { name };
      if (mode === "edit" && initialData?.id) {
        await api.put(`/upload/category-investors/${initialData.id}`, payload);
      } else {
        await api.post(`/upload/category-investors`, payload);
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Submit failed",
        text: parseApiError(err),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 grid place-items-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">
          {mode === "edit" ? "Edit Investor Category" : "New Investor Category"}
        </h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              placeholder="Contoh: Laporan Tahunan, Laporan Keuangan"
            />
            {/* slug di-BE auto dari name, jadi tak perlu field slug di FE */}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="px-3 py-2 rounded-lg text-white"
            style={{ background: BRAND }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
