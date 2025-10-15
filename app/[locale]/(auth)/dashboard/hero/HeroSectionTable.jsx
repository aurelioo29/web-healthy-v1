"use client";

import React from "react";
import api from "@/lib/axios";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import HeroSectionFormModal from "./HeroSectionFormModal";
import Swal from "sweetalert2";

const ENDPOINT = "/upload/hero-sections";

// loader biar Next/Image bisa load URL absolut tanpa atur next.config
const passThroughLoader = ({ src }) => src;

// label untuk kolom Position
const POS_LABELS = {
  left: "Left (image kiri, text kanan)",
  right: "Right (image kanan, text kiri)",
};

function PositionPill({ pos }) {
  const isLeft = String(pos) === "left";
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 bg-sky-50 text-sky-700 ring-sky-200">
      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
      {isLeft ? "Left" : "Right"}
    </span>
  );
}

// --- Image Preview Overlay ---
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

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const arr = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        Previous
      </button>
      {arr.map((n) => (
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

export default function HeroSectionTable() {
  const [rows, setRows] = React.useState([]);
  const [meta, setMeta] = React.useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(6);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  // preview state
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState("");
  const [previewAlt, setPreviewAlt] = React.useState("");

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
      const { data } = await api.get(ENDPOINT, {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
        headers: { "Cache-Control": "no-cache" },
      });

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[hero] raw:", data);
      }

      const payload = data?.data ?? data?.result ?? data;

      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload && typeof payload === "object") {
        list =
          payload.sections || // controller versi about/hero
          payload.heroSections ||
          payload.items ||
          payload.rows ||
          payload.data ||
          [];
        if (!Array.isArray(list)) list = pickFirstArray(payload);
      }

      const norm = (list || []).map((r) => {
        const i18nArr = Array.isArray(r.i18n) ? r.i18n : [];
        const idTitle =
          i18nArr.find((x) => String(x.locale).toLowerCase() === "id")?.title ||
          "";
        const enTitle =
          i18nArr.find((x) => String(x.locale).toLowerCase() === "en")?.title ||
          "";

        // Fallback untuk key yang berbeda-beda
        const position =
          r.position ??
          r.pos ??
          r.align ??
          r.image_position ??
          r.imagePosition ??
          "";

        const initialData = {
          ...r,
          position, // pastikan kebawa saat edit
          imageUrl: r.imageUrl || r.image_url || r.image || "",
          image_alt: r.image_alt || r.alt || r.imageAlt || "",
        };

        return {
          id: r.id,
          page_key: r.page_key || r.pageKey || "",
          position,
          is_active:
            typeof r.is_active === "boolean"
              ? r.is_active
              : String(r.is_active) !== "false",
          imageUrl: r.imageUrl || r.image_url || r.image || "",
          image_alt: r.image_alt || r.alt || r.imageAlt || "",
          title_id: idTitle,
          title_en: enTitle,
          created_at: r.created_at || r.createdAt || null,
          i18n: i18nArr,
          __initial: initialData,
        };
      });

      const total =
        payload?.total ??
        payload?.count ??
        payload?.totalSections ??
        payload?.totalItems ??
        norm.length;
      const totalPages =
        payload?.totalPages ??
        Math.max(Math.ceil((total || 0) / (sizeArg || 1)), 1);
      const currentPage = payload?.currentPage ?? pageArg;

      setRows(norm);
      setMeta({ total, totalPages, currentPage });
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load data");
      setRows([]);
      setMeta({ total: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchList({ pageArg: page, sizeArg: size, searchArg: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row.__initial || row);
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menghapus item "${
        row?.page_key ?? "(tanpa judul)"
      }"?`,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!isConfirmed) return;
    try {
      await api.delete(`${ENDPOINT}/${row.id}`);
      await fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
      setPage(1);
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: e?.response?.data?.message || e.message || "Gagal menghapus",
      });
    }
  };

  const openPreview = (src, alt) => {
    if (!src) return;
    setPreviewSrc(src);
    setPreviewAlt(alt || "Preview");
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
              placeholder="Search page/title…"
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
              <th className="py-3 px-3 text-left font-semibold">Page</th>
              <th className="py-3 px-3 text-left font-semibold">
                Title (ID / EN)
              </th>
              <th className="py-3 px-3 text-left font-semibold">Position</th>
              <th className="py-3 px-3 text-left font-semibold">Active</th>
              <th className="py-3 px-3 text-left font-semibold">Image</th>
              <th className="py-3 pr-6 pl-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}

            {empty && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
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
                  <td className="py-4 px-3 font-medium text-slate-900">
                    {r.page_key || "—"}
                  </td>
                  <td className="py-4 px-3">
                    <div className="text-slate-900">{r.title_id || "—"}</div>
                    <div className="text-slate-500 text-xs">
                      {r.title_en || "—"}
                    </div>
                  </td>

                  {/* Position pakai label yang lebih jelas + fallback '—' */}
                  <td className="py-4 px-3">
                    <PositionPill pos={r.position} />
                  </td>

                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                        r.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          r.is_active ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    {r.imageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          openPreview(
                            r.imageUrl,
                            r.image_alt || r.title_id || r.page_key
                          )
                        }
                        title="Preview image"
                        className="relative h-11 w-16 overflow-hidden rounded-md ring-1 ring-slate-200 bg-white cursor-zoom-in"
                      >
                        <Image
                          src={r.imageUrl}
                          alt={r.image_alt || r.title_id || r.page_key}
                          fill
                          className="object-cover"
                          sizes="64px"
                          loader={passThroughLoader}
                          unoptimized
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
          Showing <span className="font-medium">{rows.length}</span> of{" "}
          <span className="font-medium">{meta.total}</span>
        </p>
        <Pagination
          page={meta.currentPage}
          pages={meta.totalPages}
          onChange={(n) => setPage(n)}
        />
      </div>

      {/* Modal Form */}
      <HeroSectionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editing ? "edit" : "create"}
        initialData={editing}
        onSuccess={() => {
          setModalOpen(false);
          setEditing(null);
          fetchList({ pageArg: page, sizeArg: size, searchArg: search });
        }}
      />

      {/* Image Preview */}
      <ImagePreview
        open={previewOpen}
        src={previewSrc}
        alt={previewAlt}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
