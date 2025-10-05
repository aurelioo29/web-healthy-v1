"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/axios";

const CREATE_PATH = "/upload/testimonis";
const UPDATE_PATH = "/upload/testimonis";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

// fallback bangun URL gambar dari rel-path
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `testimoni/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

export default function TestimoniFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  // form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const [content, setContent] = useState("");
  const [linkVideo, setLinkVideo] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // hydrate/reset saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (isEdit && initialData) {
      setName(initialData.name || "");
      setAge(String(initialData.age ?? ""));
      setJob(initialData.job || "");
      setContent(initialData.content || "");
      setLinkVideo(initialData.link_video || "");
      setImageFile(null);
      setImagePreview(initialData.imageUrl || buildImageUrl(initialData.image));
    } else {
      setName("");
      setAge("");
      setJob("");
      setContent("");
      setLinkVideo("");
      setImageFile(null);
      setImagePreview("");
    }
  }, [open, isEdit, initialData]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setImagePreview(f ? URL.createObjectURL(f) : "");
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name wajib diisi";
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum <= 0)
      e.age = "Age harus angka > 0";
    if (!job.trim()) e.job = "Job wajib diisi";
    if (!content.trim()) e.content = "Content wajib diisi";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setErrors({});

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("age", String(Number(age)));
      fd.append("job", job.trim());
      fd.append("content", content); // text biasa (bukan HTML)
      if (linkVideo) fd.append("link_video", linkVideo.trim());
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
            {isEdit ? "Edit Testimoni" : "Tambah Testimoni"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errors._global && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors._global}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5" noValidate>
          {/* name & age */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.name ? "ring-rose-300" : "ring-slate-200"
                }`}
                maxLength={100}
                required
              />
              <FieldError>{errors.name}</FieldError>
            </div>
            <div>
              <label className="text-sm text-slate-700">Age</label>
              <input
                type="number"
                min={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.age ? "ring-rose-300" : "ring-slate-200"
                }`}
                required
              />
              <FieldError>{errors.age}</FieldError>
            </div>
          </div>

          {/* job */}
          <div>
            <label className="text-sm text-slate-700">Job</label>
            <input
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                errors.job ? "ring-rose-300" : "ring-slate-200"
              }`}
              maxLength={100}
              required
            />
            <FieldError>{errors.job}</FieldError>
          </div>

          {/* content */}
          <div>
            <label className="text-sm text-slate-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                errors.content ? "ring-rose-300" : "ring-slate-200"
              }`}
              placeholder="Tulis testimoni di sini…"
              required
            />
            <FieldError>{errors.content}</FieldError>
          </div>

          {/* link video */}
          <div>
            <label className="text-sm text-slate-700">
              Link Video (opsional)
            </label>
            <input
              value={linkVideo}
              onChange={(e) => setLinkVideo(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
              placeholder="https://youtube.com/…"
            />
          </div>

          {/* image */}
          <div>
            <label className="text-sm text-slate-700">Image (opsional)</label>
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

          {/* actions */}
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
