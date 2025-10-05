"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "@/lib/axios";
import SertifikatFormModal from "./SertifikatFormModal";

/* ===== Endpoint: sesuaikan kalau beda ===== */
const LIST_PATH = "/upload/about-us-sertifikat";
const DELETE_PATH = "/upload/about-us-sertifikat";

/* ===== Helpers ===== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const buildImageUrl = (image, imageUrl) => {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return `${ASSET_BASE.replace(/\/$/, "")}/${String(image).replace(
    /^\/+/,
    ""
  )}`;
};
const fmtYMD = (v) => {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

function ImagePreview({ open, src, alt, onClose }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const ph = document.documentElement.style.overflow;
    const pb = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = ph || "";
      document.body.style.overflow = pb || "";
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
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20"
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

function StatusPill({ status }) {
  const pub = String(status).toLowerCase() === "published";
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        pub
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-700 ring-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          pub ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />
      {pub ? "Published" : "Draft"}
    </span>
  );
}

function Row({ item, onEdit, onDelete, onPreview }) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title || "Image"}
              className="h-16 w-24 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
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
            <div className="h-16 w-24 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500">
              No Image
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.title}
            </div>
            <div className="text-xs text-slate-500">{item.date || "-"}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-3">
        <StatusPill status={item.status} />
      </td>
      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
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

export default function SertifikatTable() {
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

  // 1) Ganti extractor jadi versi "deep & smart"
  const extractList = (payload) => {
    // payload bisa: array langsung / object nested
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    // kandidat umum (top-level)
    const topCandidates = [
      payload.rows,
      payload.items,
      payload.list,
      payload.results,
      payload.data, // kadang langsung array di data
      payload.sertifikats, // plural EN
      payload.sertifikat, // singular EN
      payload.about_us_sertifikat, // snake_case
      payload.aboutUsSertifikat, // camelCase
      payload.records,
      payload.collection,
      payload.entries,
    ].filter(Boolean);

    const topArray = topCandidates.find(Array.isArray);
    if (topArray) return topArray;

    // kalau bukan di atas, cari 1–2 level dalam
    for (const v of Object.values(payload)) {
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") {
        const inner = extractList(v);
        if (inner.length) return inner;
      }
    }
    return [];
  };

  // 2) Di fetchList, perkuat pembacaan payload & meta
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

      // Banyak BE kirim { code, success, data }, kadang { result }, dll
      const envelope = data ?? {};
      const payload = envelope.data ?? envelope.result ?? envelope;

      const listRaw = extractList(payload);

      // --- meta yang fleksibel ---
      const total = Number(
        (Array.isArray(payload)
          ? listRaw.length
          : payload.total ??
            payload.count ??
            payload.totalItems ??
            payload.totalCount ??
            (Array.isArray(listRaw) ? listRaw.length : 0)) || 0
      );

      const totalPages = Number(
        (Array.isArray(payload)
          ? 1
          : payload.totalPages ??
            payload.total_pages ??
            payload.pages ??
            (total && sizeArg ? Math.max(1, Math.ceil(total / sizeArg)) : 1)) ||
          1
      );

      const currentPage = Number(
        (Array.isArray(payload)
          ? 1
          : payload.currentPage ??
            payload.page ??
            payload.pageIndex ??
            pageArg) || 1
      );

      const mapped = (listRaw || []).map((s, i) => ({
        ...s,
        title: s.title || "",
        date: fmtYMD(s.date || s.created_at),
        imageUrl: s.imageUrl || buildImageUrl(s.image),
        rowNo: (currentPage - 1) * sizeArg + i + 1,
      }));

      setRows(mapped);
      setMeta({ total, totalPages, currentPage });

      // DEBUG opsional: kalau masih kosong, log bentuk payload biar kelihatan kuncinya
      if (!mapped.length) {
        // eslint-disable-next-line no-console
        console.debug("[Sertifikat] Empty mapped, payload was:", payload);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
      setRows([]);
      setMeta({ total: 0, totalPages: 1, currentPage: 1 });
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
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`${DELETE_PATH}/${item.id}`);
      setPage(1);
      fetchList({ pageArg: 1, sizeArg: size, searchArg: search });
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
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
              placeholder="Search title…"
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
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {/* Error bar */}
      {err ? (
        <div className="mx-4 mb-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Item</th>
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
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No data.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((item) => (
                <Row
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

      {/* Modal & Preview */}
      <SertifikatFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
        }}
      />
      <ImagePreview
        open={preview.open}
        src={preview.src}
        alt={preview.alt}
        onClose={closePreview}
      />
    </div>
  );
}
