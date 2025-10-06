"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import CsrEditor from "../../csr/CsrEditor";

/* =====================
   Constants
===================== */
export const LOCALES = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
];

export const EMPTY_LOCALE = { title: "", body_html: "" };

const CREATE_PATH = "/upload/about-us-president";
const UPDATE_PATH = "/upload/about-us-president";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

/* =====================
   Helpers
===================== */
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `services/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

/** Kirim i18n nested array + fallback flat keys (tanpa subtitle) */
function appendI18nToFormData(fd, i18nObj) {
  Object.entries(i18nObj).forEach(([loc, vals], idx) => {
    const title = vals?.title ?? "";
    const body_html = vals?.body_html ?? "";

    // nested object style
    fd.append(`i18n[${idx}][locale]`, loc);
    fd.append(`i18n[${idx}][title]`, title);
    fd.append(`i18n[${idx}][body_html]`, body_html);

    // flat fallbacks (untuk BE lama)
    fd.append(`title_${loc}`, title);
    fd.append(`body_${loc}`, body_html);
    fd.append(`body_html_${loc}`, body_html);
  });
}

/** Normalisasi i18n => { id: {...}, en: {...} } */
function normalizeI18n(src, initialData) {
  const base = { id: { ...EMPTY_LOCALE }, en: { ...EMPTY_LOCALE } };

  if (Array.isArray(src)) {
    src.forEach((tr) => {
      const loc = tr?.locale?.toLowerCase?.();
      if (loc === "id" || loc === "en") {
        base[loc] = {
          title: tr.title || "",
          body_html: tr.body_html || "",
        };
      }
    });
  } else if (src && typeof src === "object") {
    base.id = {
      title:
        src.id?.title ??
        initialData?.title_id ??
        initialData?.titleId ??
        initialData?.i18n_id?.title ??
        "",
      body_html:
        src.id?.body_html ??
        initialData?.body_html_id ??
        initialData?.i18n_id?.body_html ??
        "",
    };
    base.en = {
      title:
        src.en?.title ??
        initialData?.title_en ??
        initialData?.titleEn ??
        initialData?.i18n_en?.title ??
        "",
      body_html:
        src.en?.body_html ??
        initialData?.body_html_en ??
        initialData?.i18n_en?.body_html ??
        "",
    };
  }
  return base;
}

/* =====================
   Component
===================== */
export default function AboutUsPresidentFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  // form state
  const [serviceKey, setServiceKey] = useState("");
  const [position, setPosition] = useState("left"); // ⬅️ pakai position
  const [orderNo, setOrderNo] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [i18n, setI18n] = useState({
    id: { ...EMPTY_LOCALE },
    en: { ...EMPTY_LOCALE },
  });
  const [activeLocale, setActiveLocale] = useState("id");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // hydrate/reset saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (isEdit && initialData) {
      setServiceKey(
        initialData.key ||
          initialData.service_key ||
          initialData.section_key ||
          ""
      );
      setPosition(initialData.position || "left");
      setOrderNo(Number(initialData.order_no || initialData.order_number || 1));
      setIsActive(
        Boolean(
          typeof initialData.is_active === "boolean"
            ? initialData.is_active
            : String(initialData.is_active) !== "false"
        )
      );
      setImageFile(null);
      setImagePreview(initialData.imageUrl || buildImageUrl(initialData.image));

      const src = initialData.i18n || initialData.translations || null;
      setI18n(normalizeI18n(src, initialData));
      setActiveLocale("id");
    } else {
      setServiceKey("");
      setPosition("left");
      setOrderNo(1);
      setIsActive(true);
      setImageFile(null);
      setImagePreview("");
      setI18n({ id: { ...EMPTY_LOCALE }, en: { ...EMPTY_LOCALE } });
      setActiveLocale("id");
    }
  }, [open, isEdit, initialData]);

  // handlers
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setImagePreview(f ? URL.createObjectURL(f) : "");
  };

  const updateLocaleField = (loc, field, value) => {
    setI18n((prev) => ({
      ...prev,
      [loc]: {
        ...prev[loc],
        [field]: value,
      },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const fd = new FormData();
      // gunakan service_key; sertakan section_key untuk kompat lama
      fd.append("service_key", serviceKey);
      fd.append("section_key", serviceKey);
      fd.append("position", position); // ⬅️ kirim position
      fd.append("order_no", String(orderNo || 1));
      fd.append("is_active", String(!!isActive));
      if (imageFile) fd.append("image", imageFile);

      // i18n
      appendI18nToFormData(fd, i18n);

      if (isEdit && initialData?.id) {
        const loc = activeLocale; // 'id' | 'en'
        fd.append("title", i18n[loc]?.title || "");
        fd.append("body_html", i18n[loc]?.body_html || "");

        await api.put(`${UPDATE_PATH}/${initialData.id}?locale=${loc}`, fd, {
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
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit About Us President" : "Tambah About Us President"}
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
          {/* Key */}
          <div>
            <label className="text-sm text-slate-700">Service Key</label>
            <input
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                errors.service_key || errors.section_key
                  ? "ring-rose-300"
                  : "ring-slate-200"
              }`}
              placeholder="e.g. prp, scaling, veneer…"
              required
              maxLength={100}
            />
            <FieldError>{errors.service_key || errors.section_key}</FieldError>
          </div>

          {/* Grid: position, order, active */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-slate-700">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.position ? "ring-rose-300" : "ring-slate-200"
                }`}
              >
                <option value="left">Left (image kiri, text kanan)</option>
                <option value="right">Right (image kanan, text kiri)</option>
              </select>
              <FieldError>{errors.position}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">Order</label>
              <input
                type="number"
                min={1}
                value={orderNo}
                onChange={(e) => setOrderNo(Number(e.target.value || 1))}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.order_no ? "ring-rose-300" : "ring-slate-200"
                }`}
                required
              />
              <FieldError>{errors.order_no}</FieldError>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Active
              </label>
            </div>
          </div>

          {/* Image (opsional) */}
          <div>
            <label className="text-sm text-slate-700">Image (optional)</label>
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

          {/* Tabs Locale */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 px-2 pt-2">
              {LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setActiveLocale(loc.code)}
                  className={`rounded-t-lg px-3 py-2 text-sm ${
                    activeLocale === loc.code
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Panel per-locale */}
            {LOCALES.map((loc) => {
              const code = loc.code;
              const data = i18n[code] || EMPTY_LOCALE;
              const hidden = activeLocale !== code;

              return (
                <div key={code} className={hidden ? "hidden" : "block"}>
                  <div>
                    <label className="text-sm text-slate-700">
                      Title ({code.toUpperCase()})
                    </label>
                    <input
                      value={data.title}
                      onChange={(e) =>
                        updateLocaleField(code, "title", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                    />
                    <FieldError>{errors[`i18n.${code}.title`]}</FieldError>
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-slate-700 mb-1 block">
                      Body ({code.toUpperCase()})
                    </label>
                    <div
                      className={`rounded-lg ring-1 ${
                        errors[`i18n.${code}.body_html`]
                          ? "ring-rose-300"
                          : "ring-slate-200"
                      }`}
                    >
                      <CsrEditor
                        value={data.body_html}
                        onChange={(val) =>
                          updateLocaleField(code, "body_html", val)
                        }
                      />
                    </div>
                    <FieldError>{errors[`i18n.${code}.body_html`]}</FieldError>
                  </div>
                </div>
              );
            })}
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
