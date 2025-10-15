"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "@/lib/axios";
import LayananKlinikFormModal from "./LayananKlinikFormModal";
import Swal from "sweetalert2";

/* =========================
   Helpers & constants
========================= */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";

// Endpoint layanan
const LIST_PATH = "/upload/layanan-klinik";
const DELETE_PATH = "/upload/layanan-klinik";

const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `services/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const fmtYMD = (v) => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d1 = new Date(s);
  if (!Number.isNaN(d1.getTime())) return d1.toISOString().slice(0, 10);
  const ms = Number(s);
  if (!Number.isNaN(ms)) {
    const d2 = new Date(ms);
    if (!Number.isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  }
  return "";
};

function StatusPill({ active }) {
  const isActive =
    active === true ||
    active === 1 ||
    active === "1" ||
    String(active).toLowerCase() === "true";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-700 ring-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function PositionPill({ pos }) {
  const isLeft = String(pos) === "left";
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 bg-sky-50 text-sky-700 ring-sky-200">
      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
      {isLeft ? "Left" : "Right"}
    </span>
  );
}

function ImagePreview({ open, src, alt, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml || "";
      document.body.style.overflow = prevBody || "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Preview"}
          className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
          onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
        />
        <div className="mt-3 flex items-center justify-between text-slate-200">
          <div className="text-sm line-clamp-1">{alt || "Preview"}</div>
          <div className="flex items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
              title="Open in new tab"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Close preview"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Row
========================= */
function ServiceRow({ item, onEdit, onDelete, onPreview }) {
  const titleID = item.i18n?.id?.title || "-";
  const titleEN = item.i18n?.en?.title || "-";

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>

      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={titleID || item.key}
              className="h-16 w-24 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
              role="button"
              tabIndex={0}
              onClick={() => onPreview?.(item.imageUrl, titleID || item.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  onPreview?.(item.imageUrl, titleID || item.key);
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="h-16 w-24 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500">
              No Image
            </div>
          )}
          <div className="gap-y-1 flex flex-1 flex-col min-w-0">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.key}
            </div>
            <div className="text-xs text-slate-600 line-clamp-1">
              <span className="font-medium">ID:</span> {titleID}
            </div>
            <div className="text-xs text-slate-600 line-clamp-1">
              <span className="font-medium">EN:</span> {titleEN}
            </div>
          </div>
        </div>
      </td>

      {/* ⬇️ posisi */}
      <td className="py-4 px-3">
        <PositionPill pos={item.position} />
      </td>

      <td className="py-4 px-3 text-slate-600">{item.date || "-"}</td>
      <td className="py-4 px-3 text-slate-600">{item.order_number ?? "-"}</td>
      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
      </td>
      <td className="py-4 px-3">
        <StatusPill active={item.is_active} />
      </td>

      <td className="py-4 pr-6 pl-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(item)}
            className="grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4 text-slate-700" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => onDelete(item)}
            className="grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Trash2 className="h-4 w-4 text-slate-700" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================
   Main Table
========================= */
export default function LayananKlinikTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });
  const openPreview = (src, alt = "") => setPreview({ open: true, src, alt });
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });

  const fetchList = async ({
    pageArg = page,
    sizeArg = size,
    searchArg = search,
  } = {}) => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(LIST_PATH, {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
        headers: { "Cache-Control": "no-cache" },
      });

      const payload = data?.data;

      const services = Array.isArray(payload)
        ? payload
        : payload?.services ||
          payload?.sections ||
          payload?.items ||
          payload?.rows ||
          [];

      const total = Array.isArray(payload)
        ? payload.length
        : payload?.totalServices ??
          payload?.totalSections ??
          payload?.total ??
          services.length;

      const totalPages = Array.isArray(payload)
        ? 1
        : Math.max(payload?.totalPages || 1, 1);

      const currentPage = Array.isArray(payload)
        ? 1
        : payload?.currentPage || pageArg;

      const mapped = (services || []).map((s, i) => {
        const i18nObj = Array.isArray(s.i18n)
          ? s.i18n.reduce(
              (acc, cur) => (cur?.locale ? { ...acc, [cur.locale]: cur } : acc),
              {}
            )
          : s.i18n || {};

        const created =
          s.created_at ??
          s.createdAt ??
          s.created ??
          s.created_on ??
          s.createdOn ??
          s.created_date ??
          s.createdDate;

        return {
          ...s,
          key: s.service_key || s.section_key,
          position: s.position || "left", // ⬅️ map posisi
          order_number: s.order_no,
          date: fmtYMD(created),
          is_active: s.is_active ?? s.isActive,
          rowNo: (currentPage - 1) * sizeArg + i + 1,
          imageUrl: s.imageUrl || buildImageUrl(s.image),
          i18n: {
            id: {
              title:
                i18nObj?.id?.title ||
                s.title_id ||
                s.titleId ||
                s.i18n_id?.title ||
                "",
              body_html:
                i18nObj?.id?.body_html ||
                s.body_html_id ||
                s.i18n_id?.body_html ||
                "",
            },
            en: {
              title:
                i18nObj?.en?.title ||
                s.title_en ||
                s.titleEn ||
                s.i18n_en?.title ||
                "",
              body_html:
                i18nObj?.en?.body_html ||
                s.body_html_en ||
                s.i18n_en?.body_html ||
                "",
            },
          },
          author: s.author,
          author_id: s.author_id,
        };
      });

      setRows(mapped);
      setMeta({ total, totalPages, currentPage });
    } catch (e) {
      if (e?.response?.status === 404) {
        setRows([]);
        setMeta({ total: 0, totalPages: 1, currentPage: 1 });
      } else {
        setErr(e?.response?.data?.message || e.message || "Failed to load");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ pageArg: page, sizeArg: size, searchArg: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const onAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };
  const onEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };
  const onDelete = async (item) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menghapus item "${
        item?.key ?? "(tanpa judul)"
      }"?`,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!isConfirmed) return;
    try {
      await api.delete(`${DELETE_PATH}/${item.id}`);
      setPage(1);
      fetchList({ pageArg: 1, sizeArg: size, searchArg: search });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.response?.data?.message || e.message || "Delete failed",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  fetchList({
                    pageArg: 1,
                    sizeArg: size,
                    searchArg: e.currentTarget.value,
                  });
                }
              }}
              placeholder="Search key/title…"
              className="pl-9 pr-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              setPage(1);
              fetchList({ pageArg: 1, sizeArg: size, searchArg: search });
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
                fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
              }}
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg ring-1 ring-slate-200 px-2 py-1 text-sm"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> New Service
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Service</th>
              <th className="py-3 px-3 text-left font-semibold">Position</th>
              {/* ⬅️ baru */}
              <th className="py-3 px-3 text-left font-semibold">Date</th>
              <th className="py-3 px-3 text-left font-semibold">Order</th>
              <th className="py-3 px-3 text-left font-semibold">Author</th>
              <th className="py-3 px-3 text-left font-semibold">Status</th>
              <th className="py-3 pr-6 pl-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  Loading services…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  No services found.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((item) => (
                <ServiceRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPreview={openPreview}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 text-sm text-slate-600">
        <p>
          Showing <span className="font-medium">{rows.length}</span> of{" "}
          <span className="font-medium">{meta.total}</span> services
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.currentPage === 1}
            className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-8 w-8 rounded-md grid place-content-center text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                n === meta.currentPage
                  ? "bg-sky-500 text-white ring-sky-500"
                  : ""
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={meta.currentPage === meta.totalPages}
            className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal form */}
      <LayananKlinikFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
        }}
      />

      {/* Preview */}
      <ImagePreview
        open={preview.open}
        src={preview.src}
        alt={preview.alt}
        onClose={closePreview}
      />
    </div>
  );
}
