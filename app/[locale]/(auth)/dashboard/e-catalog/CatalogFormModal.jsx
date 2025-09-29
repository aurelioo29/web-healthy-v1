"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import ImagePicker from "../lab-tests/categories/ImagePicker";
import CsrEditor from "../csr/CsrEditor";

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

export default function CatalogFormModal({
  open,
  onClose,
  mode = "create", // "create" | "edit"
  initialData = null,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");

  const [priceOriginal, setPriceOriginal] = useState("");
  const [priceDiscount, setPriceDiscount] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [status, setStatus] = useState("draft");

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const [file, setFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);

  // load kategori saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    api
      .get("/upload/category-catalogs", { params: { page: 1, size: 200 } })
      .then((res) => setCategories(res?.data?.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, [open]);

  // isi form saat buka modal
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setTitle(initialData.title || "");
      setDate((initialData.date || "").slice(0, 10));
      setCategoryId(initialData.category_id || "");
      setContent(initialData.content || "");

      setPriceOriginal(
        initialData.price_original != null
          ? String(initialData.price_original)
          : ""
      );
      setPriceDiscount(
        initialData.price_discount != null
          ? String(initialData.price_discount)
          : ""
      );
      setCurrency(initialData.currency || "IDR");
      setStatus(initialData.status || "draft");

      setPreviewUrl(initialData.imageUrl || "");
      setFile(null);
    } else {
      setTitle("");
      setDate("");
      setCategoryId("");
      setContent("");
      setPriceOriginal("");
      setPriceDiscount("");
      setCurrency("IDR");
      setStatus("draft");
      setPreviewUrl("");
      setFile(null);
    }
  }, [open, initialData]);

  // handle pilih/hapus file dari ImagePicker
  const handlePickFile = (f) => {
    // Komponen ImagePicker kamu mengirim File langsung
    const picked = f instanceof File ? f : null;
    setFile(picked);
    setPreviewUrl(
      picked ? URL.createObjectURL(picked) : initialData?.imageUrl || ""
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("date", date);
      fd.append("category_id", String(categoryId));
      fd.append("content", content);
      if (priceOriginal !== "") fd.append("price_original", priceOriginal);
      if (priceDiscount !== "") fd.append("price_discount", priceDiscount);
      if (currency) fd.append("currency", currency);
      if (status) fd.append("status", status);
      if (file) fd.append("image", file); // nama field HARUS "image"

      const config = { headers: { "Content-Type": "multipart/form-data" } }; // override header global

      if (mode === "edit" && initialData?.id) {
        await api.put(`/upload/catalogs/${initialData.id}`, fd, config);
      } else {
        await api.post(`/upload/catalogs`, fd, config);
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      alert(parseApiError(err));
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
          {mode === "edit" ? "Edit Catalog" : "New Catalog"}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-700">
                  Price (original)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceOriginal}
                  onChange={(e) => setPriceOriginal(e.target.value)}
                  className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">
                  Price (discount)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceDiscount}
                  onChange={(e) => setPriceDiscount(e.target.value)}
                  className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-700">Currency</label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
                  placeholder="IDR"
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
            </div>

            {/* Cover Image */}
            <div>
              <label className="text-sm text-slate-700">Cover Image</label>
              <div className="mt-1">
                <ImagePicker
                  accept="image/*"
                  previewUrl={previewUrl || initialData?.imageUrl || ""}
                  value={file}
                  // dukung dua API berbeda
                  onChange={handlePickFile}
                  onChangeFile={handlePickFile}
                  previewClassName="h-40 w-full object-contain rounded-lg ring-1 ring-slate-200 bg-slate-50"
                  pickerClassName="rounded-lg ring-1 ring-slate-200 hover:ring-[#4698E3]/60"
                />
              </div>
            </div>
          </div>

          {/* kanan */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Content</label>
            <CsrEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis deskripsi katalog..."
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
