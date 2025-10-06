"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/axios";

/* =====================
   Constants
===================== */
const CREATE_PATH = "/upload/lokasi-klinik";
const UPDATE_PATH = "/upload/lokasi-klinik";

const JENIS_OPTIONS = [
  { value: "Laboratorium_Utama", label: "Laboratorium Utama" },
  { value: "Klinik", label: "Klinik" },
  { value: "Mitra_Jaringan", label: "Mitra Jaringan" },
];

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

/* =====================
   Helpers
===================== */
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = String(image).replace(/^\/+/, "");
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel}`;
};

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

export default function KlinikFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  // form state (TANPA slug)
  const [title, setTitle] = useState("");
  const [jenis, setJenis] = useState("Klinik");

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [operational, setOperational] = useState("");
  const [typeService, setTypeService] = useState("");
  const [linkMap, setLinkMap] = useState("");
  const [waNumber, setWaNumber] = useState("");

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
      setTitle(initialData.title || "");
      setJenis(initialData.jenis || "Klinik");

      setAddress(initialData.address || "");
      setPhone(initialData.phone || "");
      setOperational(initialData.operational || "");
      setTypeService(initialData.type_service || "");
      setLinkMap(initialData.link_map || "");
      setWaNumber(initialData.wa_number || "");

      setImageFile(null);
      setImagePreview(initialData.imageUrl || buildImageUrl(initialData.image));
    } else {
      // default (create)
      setTitle("");
      setJenis("Klinik");

      setAddress("");
      setPhone("");
      setOperational("");
      setTypeService("");
      setLinkMap("");
      setWaNumber("");

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
      fd.append("jenis", jenis);
      if (address) fd.append("address", address);
      if (phone) fd.append("phone", phone);
      if (operational) fd.append("operational", operational);
      if (typeService) fd.append("type_service", typeService);
      if (linkMap) fd.append("link_map", linkMap);
      if (waNumber) fd.append("wa_number", waNumber);
      if (imageFile) fd.append("image", imageFile);

      if (isEdit && initialData?.id) {
        // UPDATE: slug tidak dikirim, biarkan tetap seperti di DB
        await api.put(`${UPDATE_PATH}/${initialData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // CREATE: slug akan di-generate otomatis di BE dari title
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
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Lokasi Klinik" : "Tambah Lokasi Klinik"}
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
          {/* title */}
          <div>
            <label className="text-sm text-slate-700">Nama / Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                errors.title ? "ring-rose-300" : "ring-slate-200"
              }`}
              placeholder="Contoh: Royal Klinik - Cabang A"
              required
              maxLength={150}
            />
            <FieldError>{errors.title}</FieldError>
          </div>

          {/* jenis + WA + Maps */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-slate-700">Jenis</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.jenis ? "ring-rose-300" : "ring-slate-200"
                }`}
              >
                {JENIS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FieldError>{errors.jenis}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">No. WhatsApp</label>
              <input
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                placeholder="+628xxx / 08xxx"
                maxLength={32}
              />
              <FieldError>{errors.wa_number}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">Link Maps</label>
              <input
                value={linkMap}
                onChange={(e) => setLinkMap(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                placeholder="https://maps.google.com/..."
                maxLength={512}
              />
              <FieldError>{errors.link_map}</FieldError>
            </div>
          </div>

          {/* image */}
          <div>
            <label className="text-sm text-slate-700">Gambar (opsional)</label>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" /> Pilih File
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
                <span className="text-xs text-slate-500">Belum ada file</span>
              )}
            </div>
            <FieldError>{errors.image}</FieldError>
          </div>

          {/* address, phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700">Alamat</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400 min-h-[88px]"
                placeholder="Alamat lengkap"
              />
              <FieldError>{errors.address}</FieldError>
            </div>
            <div>
              <label className="text-sm text-slate-700">Telepon</label>
              <textarea
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400 min-h-[88px]"
                placeholder="021-xxx, 08xxx (boleh multi-line)"
              />
              <FieldError>{errors.phone}</FieldError>
            </div>
          </div>

          {/* operational, type_service */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700">Jam Operasional</label>
              <textarea
                value={operational}
                onChange={(e) => setOperational(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400 min-h-[88px]"
                placeholder="Senin–Jumat 08.00–17.00, dst."
              />
              <FieldError>{errors.operational}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">Jenis Layanan</label>
              <textarea
                value={typeService}
                onChange={(e) => setTypeService(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400 min-h-[88px]"
                placeholder="PCR, Medical Check-up, Vaksinasi, ..."
              />
              <FieldError>{errors.type_service}</FieldError>
            </div>
          </div>

          {/* Actions */}
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
