"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CsrEditor from "../csr/CsrEditor";
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

export default function InvestorFormModal({
  open,
  onClose,
  mode = "create", // "create" | "edit"
  initialData = null,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [status, setStatus] = useState("draft"); // "draft" | "published"
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const [file, setFile] = useState(null); // File (PDF)
  const [fileName, setFileName] = useState(""); // untuk tampilkan nama file existing

  const [loading, setLoading] = useState(false);

  // load kategori saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    api
      .get("/upload/category-investors", { params: { page: 1, size: 200 } })
      .then((res) => {
        const box = res?.data?.data || {};
        setCategories(
          box.categories ||
            box.category_investors ||
            box.items ||
            box.rows ||
            []
        );
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, [open]);

  // isi form saat buka modal
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title || "");
      setDate((initialData.date || "").slice(0, 10));
      setStatus(initialData.status || "draft");
      setCategoryId(initialData.category_id || "");
      setContent(initialData.content || "");

      setFile(null);
      // dari BE diharapkan ada fileUrl / file; amanin dua-duanya
      const fn =
        initialData.fileName ||
        initialData.file ||
        (initialData.fileUrl ? initialData.fileUrl.split("/").pop() : "");
      setFileName(fn || "");
    } else {
      setTitle("");
      setDate("");
      setStatus("draft");
      setCategoryId("");
      setContent("");

      setFile(null);
      setFileName("");
    }
  }, [open, initialData]);

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("date", date);
      fd.append("status", status);
      fd.append("category_id", String(categoryId));
      fd.append("content", content || "");
      if (file) fd.append("file", file); // ====> nama field HARUS "file" (sesuai BE Investor)

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (mode === "edit" && initialData?.id) {
        await api.put(`/upload/investors/${initialData.id}`, fd, config);
      } else {
        await api.post(`/upload/investors`, fd, config);
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
        className="w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">
          {mode === "edit" ? "Edit Investor" : "New Investor"}
        </h3>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* kiri */}
          <div className="space-y-4">
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

            <div>
              <label className="text-sm text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-700">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              >
                <option value="" disabled>
                  {loadingCats ? "Loading…" : "Select a category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PDF File */}
            <div>
              <label className="text-sm text-slate-700">PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={onPickFile}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 outline-none focus:ring-[#4698E3]"
              />
              {fileName ? (
                <p className="mt-1 text-xs text-slate-500">
                  Selected: {fileName}
                </p>
              ) : null}
            </div>
          </div>

          {/* kanan */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Content</label>
            <CsrEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis deskripsi…"
              height={360}
            />
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
            className="px-3 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ background: BRAND }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
