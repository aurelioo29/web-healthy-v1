"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "@/lib/axios";
import EventPromoFormModal from "./EventPromoFormModal";
import Swal from "sweetalert2";

/* =========================
   Helpers & constants
========================= */
const BASE_PATH = "/upload/event-promos";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const buildImageUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `event-promos/${image}`;
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

function StatusPill({ status }) {
  const published = String(status).toLowerCase() === "published";
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        published
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-700 ring-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          published ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />
      {published ? "Published" : "Draft"}
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
function EventPromoRow({ item, onEdit, onDelete, onPreview }) {
  return (
    <tr className="hover:bg-slate-50/60">
      {/* # */}
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>

      {/* Title + thumb */}
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title || "Event/Promo"}
              className="h-14 w-20 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
              role="button"
              tabIndex={0}
              onClick={() => onPreview?.(item.imageUrl, item.title)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  onPreview?.(item.imageUrl, item.title);
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="h-14 w-20 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500">
              No Image
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.title}
            </div>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="py-4 px-3 text-slate-600">{item.date || "-"}</td>

      {/* Status */}
      <td className="py-4 px-3">
        <StatusPill status={item.status} />
      </td>

      {/* Author */}
      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
      </td>

      {/* Actions */}
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
export default function EventPromoTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "draft", "published"

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
    statusArg = statusFilter,
  } = {}) => {
    setLoading(true);
    setErr("");

    try {
      const { data } = await api.get("/upload/event-promos", {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
          ...(statusArg ? { status: statusArg } : {}),
        },
        headers: { "Cache-Control": "no-cache" },
      });

      // --- UNWRAP payload fleksibel ---
      const unwrap = (o) =>
        o?.data !== undefined ? o.data : o?.result !== undefined ? o.result : o;

      const box = unwrap(data); // bisa {rows,count} / {items,total,...} / array
      // Cari list di beberapa kemungkinan kunci
      let list =
        (Array.isArray(box) && box) ||
        box?.items ||
        box?.rows ||
        box?.event_promos ||
        box?.eventPromos ||
        box?.list ||
        []; // fallback

      if (!list.length) {
        if (Array.isArray(data?.rows)) list = data.rows;
        else if (Array.isArray(data?.items)) list = data.items;
        else if (Array.isArray(data?.data?.rows)) list = data.data.rows;
      }

      // --- META ---
      const total =
        box?.total ??
        box?.count ??
        box?.totalItems ??
        (Array.isArray(list) ? list.length : 0);

      const currentPage = box?.currentPage ?? box?.page ?? pageArg ?? 1;

      const totalPages =
        box?.totalPages ??
        (sizeArg ? Math.max(1, Math.ceil((total || 0) / sizeArg)) : 1);

      // --- MAP ROWS ---
      const mapped = (list || []).map((s, i) => ({
        ...s,
        // normalisasi tanggal
        date: fmtYMD(s.date || s.created_at),
        // normalisasi image URL
        imageUrl: s.imageUrl || buildImageUrl(s.image),
        // row number
        rowNo: (currentPage - 1) * sizeArg + i + 1,
      }));

      setRows(mapped);
      setMeta({ total: total || mapped.length, totalPages, currentPage });
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
    fetchList({
      pageArg: page,
      sizeArg: size,
      searchArg: search,
      statusArg: statusFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, statusFilter]);

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
        item?.title ?? "(tanpa judul)"
      }"?`,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!isConfirmed) return;
    try {
      await api.delete(`${BASE_PATH}/${item.id}`);
      setPage(1);
      fetchList({
        pageArg: 1,
        sizeArg: size,
        searchArg: search,
        statusArg: statusFilter,
      });
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
        <div className="flex flex-wrap items-center gap-2">
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
                    statusArg: statusFilter,
                  });
                }
              }}
              placeholder="Search title…"
              className="pl-9 pr-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg ring-1 ring-slate-200 px-2 py-2 text-sm"
            title="Filter status"
          >
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button
            onClick={() => {
              setPage(1);
              fetchList({
                pageArg: 1,
                sizeArg: size,
                searchArg: search,
                statusArg: statusFilter,
              });
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Search
          </button>

          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPage(1);
                fetchList({
                  pageArg: 1,
                  sizeArg: size,
                  searchArg: "",
                  statusArg: "",
                });
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
            <Plus className="h-4 w-4" /> New Event/Promo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Title</th>
              <th className="py-3 px-3 text-left font-semibold">Date</th>
              <th className="py-3 px-3 text-left font-semibold">Status</th>
              <th className="py-3 px-3 text-left font-semibold">Author</th>
              <th className="py-3 pr-6 pl-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No data.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((item) => (
                <EventPromoRow
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
          <span className="font-medium">{meta.total}</span> items
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
      <EventPromoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList({
            pageArg: 1,
            sizeArg: size,
            searchArg: "",
            statusArg: statusFilter,
          });
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
