"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import CsrEditor from "./CsrEditor";
import api from "@/lib/axios";

const CREATE_PATH = "/upload/csr";
const UPDATE_PATH = "/upload/csr";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

export default function CsrFormModal({
  open,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (isEdit && initialData) {
        setTitle(initialData.title || "");
        setDate((initialData.date || "").slice(0, 10));
        setStatus(initialData.status || "draft");
        setContent(initialData.content || "");
        // preview: pakai URL gambar jika ada dari BE
        setImagePreview(initialData.imageUrl || "");
        setImageFile(null);
      } else {
        setTitle("");
        setDate("");
        setStatus("draft");
        setContent("");
        setImageFile(null);
        setImagePreview("");
      }
    }
  }, [open, isEdit, initialData]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("date", date);
      fd.append("status", status);
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[100vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit CSR Post" : "Add CSR Post"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        {errors._global && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errors._global}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                errors.title ? "ring-rose-300" : "ring-slate-200"
              }`}
              placeholder="CSR title…"
              required
              maxLength={100}
            />
            <FieldError>{errors.title}</FieldError>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.date ? "ring-rose-300" : "ring-slate-200"
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
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.status ? "ring-rose-300" : "ring-slate-200"
                }`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <FieldError>{errors.status}</FieldError>
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
                    className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No file chosen</span>
                )}
              </div>
              <FieldError>{errors.image}</FieldError>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700 mb-1 block">Content</label>
            <div
              className={`${
                errors.content ? "ring-rose-300" : "ring-slate-200"
              } rounded-lg ring-1`}
            >
              <CsrEditor
                key={isEdit ? initialData?.id ?? "create" : "create"}
                value={content}
                onChange={setContent}
              />
            </div>
            <FieldError>{errors.content}</FieldError>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
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
