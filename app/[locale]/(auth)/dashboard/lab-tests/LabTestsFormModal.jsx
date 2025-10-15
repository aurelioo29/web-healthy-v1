"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CsrEditor from "../csr/CsrEditor";
import Swal from "sweetalert2";

const BRAND = "#4698E3";

export default function LabTestFormModal({
  open,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loading, setLoading] = useState(false);

  // load kategori saat modal buka
  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    api
      .get("/upload/category-lab-tests", { params: { page: 1, size: 100 } })
      .then((res) => {
        const rows = res?.data?.data?.categories || [];
        setCategories(rows);
      })
      .finally(() => setLoadingCats(false));
  }, [open]);

  // isi form saat edit / reset saat create
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setTitle(initialData.title || "");
      setDate(initialData.date || "");
      setCategoryId(String(initialData.category_id || ""));
      setContent(initialData.content || "");
    } else {
      setTitle("");
      setDate("");
      setCategoryId("");
      setContent("");
    }
  }, [open, initialData]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title,
        date,
        category_id: Number(categoryId),
        content, // HTML dari CsrEditor
      };
      if (mode === "edit" && initialData?.id) {
        await api.put(`/upload/lab-tests/${initialData.id}`, payload);
      } else {
        await api.post(`/upload/lab-tests`, payload);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Submit failed",
        text: err?.response?.data?.message || "Submit failed",
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
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">
          {mode === "edit" ? "Edit Lab Test" : "New Lab Test"}
        </h3>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-700">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Date</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-700">Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
            >
              <option value="" disabled>
                {loadingCats ? "Loading..." : "Select a category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-700">Content</label>
            {/* Editor HTML dengan dukungan tabel */}
            <div className="mt-2">
              <CsrEditor
                value={content}
                onChange={setContent}
                placeholder="Write lab test content…"
              />
            </div>
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
