"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import ProdukLayananFormModal from "./ProdukLayananFormModal";

/* ========== Image Preview ========== */
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

/* ===== helpers ===== */
const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());
const isInternalPath = (s = "") =>
  /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/.test(String(s).trim());

function Pagination({ page, pages, onChange }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        Previous
      </button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-8 w-8 grid place-content-center rounded-md text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
            n === page ? "bg-sky-500 text-white ring-sky-500" : ""
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        Next
      </button>
    </div>
  );
}

export default function ProdukLayananTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState({ src: "", alt: "" });

  const LIST_ENDPOINT = "/upload/produk-layanan";
  const ITEM_ENDPOINT = "/upload/produk-layanan";

  const pickFirstArray = (obj) => {
    if (!obj || typeof obj !== "object") return [];
    const direct = Object.values(obj).find(Array.isArray);
    if (Array.isArray(direct)) return direct;
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") {
        const found = Object.values(v).find(Array.isArray);
        if (Array.isArray(found)) return found;
      }
    }
    return [];
  };

  const fetchList = async ({
    pageArg = page,
    sizeArg = size,
    searchArg = search,
  } = {}) => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(LIST_ENDPOINT, {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
        headers: { "Cache-Control": "no-cache" },
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("[produk-layanan] raw:", data);
      }

      const payload = data?.data ?? data?.result ?? data;

      let list = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (payload && typeof payload === "object") {
        list =
          payload.produkLayanans ||
          payload.produk_layanans ||
          payload.items ||
          payload.rows ||
          payload.list ||
          payload.data ||
          [];
        if (!Array.isArray(list)) list = pickFirstArray(payload);
      }

      const normalized = (list || []).map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        target_link: r.target_link || "",
        imageUrl: r.imageUrl || r.image_url || r.image || "",
        created_at: r.created_at || r.createdAt || null,
      }));

      const total =
        payload?.totalProdukLayanan ??
        payload?.total ??
        payload?.count ??
        normalized.length;

      const totalPages =
        payload?.totalPages ??
        Math.max(Math.ceil((total || 0) / (sizeArg || 1)), 1);

      const currentPage = payload?.currentPage ?? pageArg;

      setRows(normalized);
      setMeta({ total, totalPages, currentPage });
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load data");
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

  const onCreate = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setOpenModal(true);
  };

  const onDelete = async (row) => {
    if (!confirm(`Hapus item "${row.title}"?`)) return;
    try {
      await api.delete(`${ITEM_ENDPOINT}/${row.id}`);
      await fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
      setPage(1);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Gagal menghapus item");
    }
  };

  const openPreview = (src, alt) => {
    setPreview({ src, alt });
    setPreviewOpen(true);
  };

  const empty = !loading && rows.length === 0;

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
              placeholder="Search title/content…"
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
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span>Rows:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg ring-1 ring-slate-200 px-2 py-1"
            >
              {[6, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Title</th>
              <th className="py-3 px-3 text-left font-semibold">Content</th>
              <th className="py-3 px-3 text-left font-semibold">Target Link</th>
              <th className="py-3 px-3 text-left font-semibold">Image</th>
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
              rows.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-4 pl-6 pr-3 text-slate-700">
                    {(meta.currentPage - 1) * size + idx + 1}
                  </td>

                  <td className="py-4 px-3 text-slate-900 font-medium">
                    {r.title}
                  </td>

                  <td className="py-4 px-3 text-slate-600">
                    <span className="line-clamp-2">{r.content}</span>
                  </td>

                  <td className="py-4 px-3">
                    {r.target_link ? (
                      isInternalPath(r.target_link) ? (
                        <Link
                          href={r.target_link}
                          className="text-sky-600 hover:underline break-all"
                        >
                          {r.target_link}
                        </Link>
                      ) : (
                        <a
                          href={r.target_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline break-all"
                        >
                          {r.target_link}
                        </a>
                      )
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-4 px-3">
                    {r.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => openPreview(r.imageUrl, r.title)}
                        className="relative h-11 w-16 overflow-hidden rounded-md ring-1 ring-slate-200 bg-white cursor-zoom-in"
                        title="Click to preview"
                        aria-label={`Preview ${r.title}`}
                      >
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-4 pr-6 pl-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => onEdit(r)}
                        className="rounded-lg p-2 text-sky-600 hover:bg-sky-100"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => onDelete(r)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 text-sm text-slate-600">
        <p>
          Showing <span className="font-medium">{rows.length}</span> out of{" "}
          <span className="font-medium">{meta.total}</span> entries
        </p>
        <Pagination
          page={meta.currentPage}
          pages={meta.totalPages}
          onChange={(n) => setPage(n)}
        />
      </div>

      {err && <div className="px-6 pb-4 text-sm text-rose-600">{err}</div>}

      {/* Modal Form */}
      <ProdukLayananFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        data={editing}
        onSaved={() => {
          setOpenModal(false);
          setEditing(null);
          fetchList({ pageArg: page, sizeArg: size, searchArg: search });
        }}
      />

      {/* Image Preview */}
      <ImagePreview
        open={previewOpen}
        src={preview.src}
        alt={preview.alt}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
