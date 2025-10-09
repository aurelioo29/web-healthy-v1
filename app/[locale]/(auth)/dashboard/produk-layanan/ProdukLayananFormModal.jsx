"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import Image from "next/image";
import { X, AlertTriangle } from "lucide-react";

const BRAND = "#4698E3";

// ==== Link validators ====
// http(s)://...  (URL absolut)
const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());
// /path (internal path)
const isInternalPath = (s = "") =>
  /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/.test(String(s).trim());
// valid bila kosong, /path, atau http(s)
const isValidLink = (s = "") => !s || isHttpUrl(s) || isInternalPath(s);

export default function ProdukLayananFormModal({
  open,
  onClose,
  data, // jika ada -> edit mode
  onSaved, // callback setelah sukses simpan
}) {
  const isEdit = Boolean(data?.id);
  const [form, setForm] = useState({
    title: "",
    content: "",
    target_link: "",
    image: null, // File object baru
  });
  const [imageUrl, setImageUrl] = useState(""); // preview (baru/eksisting)
  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({});
  const [globalErr, setGlobalErr] = useState("");

  // prefill saat open edit
  useEffect(() => {
    if (!open) return;
    setFieldErr({});
    setGlobalErr("");
    setRemoveImage(false);

    if (isEdit) {
      setForm({
        title: data.title || "",
        content: data.content || "",
        target_link: data.target_link || "",
        image: null,
      });
      setImageUrl(data.imageUrl || ""); // dari BE (URL publik)
    } else {
      setForm({ title: "", content: "", target_link: "", image: null });
      setImageUrl("");
    }
  }, [open, isEdit, data]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (fieldErr[name]) {
      const next = { ...fieldErr };
      delete next[name];
      setFieldErr(next);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, image: f }));
    setRemoveImage(false);
    if (f) {
      const u = URL.createObjectURL(f);
      setImageUrl(u);
    }
  };

  const clearImage = () => {
    setForm((s) => ({ ...s, image: null }));
    if (isEdit && data?.imageUrl) {
      // user menghapus gambar eksisting
      setImageUrl("");
      setRemoveImage(true);
    } else {
      setImageUrl("");
      setRemoveImage(false);
    }
  };

  const close = () => {
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErr({});
    setGlobalErr("");

    // validasi link versi “internal atau http(s)”
    if (!isValidLink(form.target_link)) {
      setFieldErr((f) => ({
        ...f,
        target_link: "Boleh kosong, /path (internal) atau http(s):// URL",
      }));
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", form.title || "");
      fd.append("content", form.content || "");
      fd.append("target_link", (form.target_link || "").trim());
      if (form.image) fd.append("image", form.image);
      if (removeImage) fd.append("remove_image", "1");

      if (isEdit) {
        await api.put(`/upload/produk-layanan/${data.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/upload/produk-layanan`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSaved?.();
      close();
    } catch (error) {
      const resp = error?.response?.data;
      if (resp?.errors) setFieldErr(resp.errors);
      else if (resp?.message) setGlobalErr(resp.message);
      else setGlobalErr(error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 grid place-items-center p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Produk/Layanan" : "Create Produk/Layanan"}
          </h3>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global error */}
        {globalErr && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div className="text-sm">{globalErr}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="text-sm text-slate-700">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  fieldErr.title ? "ring-rose-300" : "ring-slate-200"
                }`}
                required
              />
              {fieldErr.title && (
                <p className="mt-1 text-xs text-rose-600">{fieldErr.title}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-700">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={onChange}
                rows={6}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  fieldErr.content ? "ring-rose-300" : "ring-slate-200"
                }`}
                required
              />
              {fieldErr.content && (
                <p className="mt-1 text-xs text-rose-600">{fieldErr.content}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-700">
                Target Link (opsional)
              </label>
              <input
                type="text"
                name="target_link"
                value={form.target_link}
                onChange={onChange}
                placeholder="/tes-laboratorium atau https://contoh.com/layanan"
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  fieldErr.target_link ? "ring-rose-300" : "ring-slate-200"
                }`}
              />
              {fieldErr.target_link && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErr.target_link}
                </p>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="md:col-span-1">
            <label className="text-sm text-slate-700">Cover Image</label>
            <div className="mt-1 rounded-2xl border border-slate-200 p-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                    No image
                  </div>
                )}
              </div>

              <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm hover:bg-slate-50 w-full">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFile}
                />
                Choose File
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="mt-2 text-xs text-rose-600 hover:underline"
                >
                  Hapus gambar
                </button>
              )}
              {fieldErr.image && (
                <p className="mt-2 text-xs text-rose-600">{fieldErr.image}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60"
            style={{ background: BRAND }}
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save"
              : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
