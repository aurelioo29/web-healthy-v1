"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import CsrEditor from "../csr/CsrEditor"; // ← sesuaikan path jika perlu

/* =====================
   Constants
===================== */
export const LOCALES = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
];

export const EMPTY_LOCALE = {
  title: "",
  subtitle: "",
  body_html: "",
  cta_text: "",
  cta_link: "",
};

const CREATE_PATH = "/upload/hero-sections";
const UPDATE_PATH = "/upload/hero-sections";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

// enum dari model HeroSection
const PAGE_OPTIONS = [
  ["home", "Home"],
  ["about", "About"],
  ["lab_tests", "Lab Tests"],
  ["consultation", "Consultation"],
  ["clinic_services", "Clinic Services"],
  ["corporate_health_service", "Corporate Health Service"],
  ["e_catalog", "E-Catalog"],
  ["csr", "CSR"],
  ["articles", "Articles"],
  ["investor_relations", "Investor Relations"],
  ["location", "Location"],
];

// ✅ ini aman dipakai (value ENUM, label untuk UI)
const POS_OPTIONS = [
  ["left", "Left (image kiri, text kanan)"],
  ["right", "Right (image kanan, text kiri)"],
];

/* =====================
   Helpers
===================== */
const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `hero/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-rose-600">{children}</p>;
}

/** Kirim i18n 3 gaya (keyed, array+locale, flat) biar kompatibel semua BE */
function appendI18nToFormData(fd, i18nObj) {
  const locales = Object.keys(i18nObj);
  locales.forEach((loc, idx) => {
    const v = i18nObj[loc] || {};
    const title = v.title ?? "";
    const subtitle = v.subtitle ?? "";
    const body_html = v.body_html ?? "";
    const cta_text = v.cta_text ?? "";
    const cta_link = v.cta_link ?? "";

    // keyed
    fd.append(`i18n[${loc}][title]`, title);
    fd.append(`i18n[${loc}][subtitle]`, subtitle);
    fd.append(`i18n[${loc}][body_html]`, body_html);
    fd.append(`i18n[${loc}][cta_text]`, cta_text);
    fd.append(`i18n[${loc}][cta_link]`, cta_link);

    // array + locale
    fd.append(`i18n[${idx}][locale]`, loc);
    fd.append(`i18n[${idx}][title]`, title);
    fd.append(`i18n[${idx}][subtitle]`, subtitle);
    fd.append(`i18n[${idx}][body_html]`, body_html);
    fd.append(`i18n[${idx}][cta_text]`, cta_text);
    fd.append(`i18n[${idx}][cta_link]`, cta_link);

    // flat fallback
    fd.append(`title_${loc}`, title);
    fd.append(`subtitle_${loc}`, subtitle);
    fd.append(`body_html_${loc}`, body_html);
    fd.append(`cta_text_${loc}`, cta_text);
    fd.append(`cta_link_${loc}`, cta_link);
  });
}

/** Normalisasi i18n => { id:{...}, en:{...} } */
function normalizeI18n(src, initialData) {
  const base = {
    id: { ...EMPTY_LOCALE },
    en: { ...EMPTY_LOCALE },
  };

  if (Array.isArray(src)) {
    src.forEach((tr) => {
      const loc = tr?.locale?.toLowerCase?.();
      if (loc === "id" || loc === "en") {
        base[loc] = {
          title: tr.title || "",
          subtitle: tr.subtitle || "",
          body_html: tr.body_html || "",
          cta_text: tr.cta_text || "",
          cta_link: tr.cta_link || "",
        };
      }
    });
  } else if (src && typeof src === "object") {
    ["id", "en"].forEach((loc) => {
      base[loc] = {
        title:
          src?.[loc]?.title ??
          initialData?.[`title_${loc}`] ??
          initialData?.[`title${loc.toUpperCase()}`] ??
          "",
        subtitle:
          src?.[loc]?.subtitle ?? initialData?.[`subtitle_${loc}`] ?? "",
        body_html:
          src?.[loc]?.body_html ?? initialData?.[`body_html_${loc}`] ?? "",
        cta_text:
          src?.[loc]?.cta_text ?? initialData?.[`cta_text_${loc}`] ?? "",
        cta_link:
          src?.[loc]?.cta_link ?? initialData?.[`cta_link_${loc}`] ?? "",
      };
    });
  }

  return base;
}

// 🆕 bikin alt dari nama file biar rapi (contoh: hero-banner.webp -> "Hero Banner")
const prettifyFilename = (name = "") => {
  const n = String(name).replace(/\.[^/.]+$/, "");
  const spaced = n.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return spaced
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

// 🆕 ambil label halaman dari PAGE_OPTIONS
const pageLabel = (key) => PAGE_OPTIONS.find(([k]) => k === key)?.[1] || key;

/* =====================
   Component
===================== */
export default function HeroSectionFormModal({
  open,
  onClose,
  mode = "create", // 'create' | 'edit'
  initialData = null,
  onSuccess,
}) {
  const isEdit = mode === "edit";

  // form state
  const [pageKey, setPageKey] = useState("home");
  const [position, setPosition] = useState("left");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageAlt, setImageAlt] = useState("");

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
      setPageKey(initialData.page_key || "home");
      setPosition(initialData.position || "left");
      setIsActive(
        typeof initialData.is_active === "boolean"
          ? initialData.is_active
          : String(initialData.is_active) !== "false"
      );

      setImageFile(null);
      setImagePreview(initialData.imageUrl || buildImageUrl(initialData.image));
      setImageAlt(initialData.image_alt || "");

      const src = initialData.i18n || initialData.translations || null;
      setI18n(normalizeI18n(src, initialData));
      setActiveLocale("id");
    } else {
      // default (create)
      setPageKey("home");
      setPosition("left");
      setIsActive(true);
      setImageFile(null);
      setImagePreview("");
      setImageAlt("");
      setI18n({ id: { ...EMPTY_LOCALE }, en: { ...EMPTY_LOCALE } });
      setActiveLocale("id");
    }
  }, [open, isEdit, initialData]);

  // handlers
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setImageFile(f || null);
    setImagePreview(f ? URL.createObjectURL(f) : "");
    // 🆕 auto-isi alt dari nama file kalau belum ada
    if (f && !imageAlt) {
      setImageAlt(prettifyFilename(f.name));
    }
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
      // 🆕 fallback alt otomatis kalau kosong:
      const fileNameAlt = imageFile?.name
        ? prettifyFilename(imageFile.name)
        : "";
      const computedAlt =
        (imageAlt || "").trim() ||
        (i18n[activeLocale]?.title || "").trim() ||
        (i18n.id?.title || "").trim() ||
        (i18n.en?.title || "").trim() ||
        fileNameAlt ||
        pageLabel(pageKey) ||
        "Hero image";

      const fd = new FormData();
      fd.append("page_key", pageKey);
      fd.append("position", position);
      fd.append("is_active", String(!!isActive));
      fd.append("image_alt", computedAlt); // ← selalu kirim alt hasil komputasi
      if (imageFile) fd.append("image", imageFile);

      // kirim semua i18n (multi-format)
      appendI18nToFormData(fd, i18n);

      if (isEdit && initialData?.id) {
        // opsional: BE kamu support update single-locale via ?locale=
        const loc = activeLocale; // 'id' | 'en'
        fd.append("title", i18n[loc]?.title || "");
        fd.append("subtitle", i18n[loc]?.subtitle || "");
        fd.append("body_html", i18n[loc]?.body_html || "");
        fd.append("cta_text", i18n[loc]?.cta_text || "");
        fd.append("cta_link", i18n[loc]?.cta_link || "");

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
            {isEdit ? "Edit Hero Section" : "Add Hero Section"}
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
          {/* Grid: page, position, active */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm text-slate-700">Page</label>
              <select
                value={pageKey}
                onChange={(e) => setPageKey(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.page_key ? "ring-rose-300" : "ring-slate-200"
                }`}
                disabled={isEdit} // unik, kunci saat edit
              >
                {PAGE_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError>{errors.page_key}</FieldError>
            </div>

            <div>
              <label className="text-sm text-slate-700">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                  errors.position ? "ring-rose-300" : "ring-slate-200"
                }`}
              >
                {POS_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError>{errors.position}</FieldError>
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

          {/* Image + alt (alt input dihilangkan, alt digenerate otomatis) */}
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
                onChange={onPickFile} // <-- masih sama
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

            {/* Field alt DIHAPUS, tapi error dari BE tetap bisa ditampilkan di sini */}
            <FieldError>{errors.image_alt}</FieldError>
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
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        required={code === "id"} // minimal isi satu locale
                      />
                      <FieldError>{errors[`i18n.${code}.title`]}</FieldError>
                    </div>

                    <div>
                      <label className="text-sm text-slate-700">
                        Subtitle ({code.toUpperCase()})
                      </label>
                      <input
                        value={data.subtitle}
                        onChange={(e) =>
                          updateLocaleField(code, "subtitle", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                        maxLength={255}
                      />
                    </div>
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

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-700">
                        CTA Text ({code.toUpperCase()})
                      </label>
                      <input
                        value={data.cta_text}
                        onChange={(e) =>
                          updateLocaleField(code, "cta_text", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                        placeholder="Contoh: Lihat Selengkapnya"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">
                        CTA Link ({code.toUpperCase()})
                      </label>
                      <input
                        value={data.cta_link}
                        onChange={(e) =>
                          updateLocaleField(code, "cta_link", e.target.value)
                        }
                        className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm outline-none focus:ring-sky-400"
                        placeholder="/tes-laboratorium atau https://..."
                      />
                    </div>
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
