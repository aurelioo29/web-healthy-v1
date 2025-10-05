"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/axios";

/* ====== ENDPOINTS (ubah sesuai BE kamu) ====== */
const LIST_PATH   = "/upload/about-us-gallery";
const CREATE_PATH = "/upload/about-us-gallery";
const UPDATE_PATH = "/upload/about-us-gallery";
const DELETE_PATH = "/upload/about-us-gallery";

/* ====== ASSET BASE untuk path relatif ====== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const join = (base, path) =>
  `${base.replace(/\/$/, "")}/${String(path).replace(/^\/+/, "")}`;
const buildImageUrl = (image, imageUrl) => {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return join(ASSET_BASE, image);
};

const fmtYMD = (v) => {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

export default function GalleryFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(fmtYMD(new Date()));
  const [status, setStatus] = useState("draft");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (isEdit && initialData) {
      setTitle(initialData.title || "");
      setDate(fmtYMD(initialData.date) || fmtYMD(initialData.created_at) || "");
      setStatus((initialData.status || "draft").toLowerCase());

      setImageFile(null);
      setImagePreview(initialData.imageUrl || buildImageUrl(initialData.image));
    } else {
      setTitle("");
      setDate(fmtYMD(new Date()));
      setStatus("draft");
      setImageFile(null);
      setImagePreview("");
    }
  }, [open, isEdit, initialData]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setImagePreview(f ? URL.createObjectURL(f) : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("date", date || "");
      fd.append("status", status || "draft");
      if (imageFile) fd.append("image", imageFile);

      if (isEdit && initialData?.id) {
        await api.put(`${UPDATE_PATH}/${initialData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(CREATE_PATH, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setErrors(data.errors);
      } else if (data?.message) {
        setErrors({ _global: data.message });
      } else {
        setErrors({ _global: err.message || "Failed to save" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Gallery Item" : "Add Gallery Item"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors._global && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors._global}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label className="text-sm text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none ${
                errors.title ? "ring-rose-300 focus:ring-rose-400" : "ring-slate-200 focus:ring-sky-400"
              }`}
              placeholder="Judul gambar…"
              required
              maxLength={150}
            />
            <FieldError>{errors.title}</FieldError>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none ${
                  errors.date ? "ring-rose-300 focus:ring-rose-400" : "ring-slate-200 focus:ring-sky-400"
                }`}
                required
              />
              <FieldError>{errors.date}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700">Image</label>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" /> Choose File
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-12 w-12 rounded object-cover ring-1 ring-slate-200"
                />
              ) : (
                <span className="text-xs text-slate-500">No file chosen</span>
              )}
            </div>
            <FieldError>{errors.image}</FieldError>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { LIST_PATH, CREATE_PATH, UPDATE_PATH, DELETE_PATH, buildImageUrl, fmtYMD };
