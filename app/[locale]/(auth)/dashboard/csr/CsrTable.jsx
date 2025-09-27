"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import api from "@/lib/axios";
import CsrFormModal from "./CsrFormModal";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

function StatusBadge({ value }) {
  const map = {
    published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  const cls = map[value] || "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          value === "published" ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {value === "published" ? "Published" : "Draft"}
    </span>
  );
}

function CsrRow({ item, me, onEdit, onDelete, onPreview }) {
  const canEdit = me && item.author_id === me.id;

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-20 w-28 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
              onClick={() => onPreview?.(item.imageUrl, item.title)}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const holder =
                  e.currentTarget.parentElement?.querySelector(".no-image");
                if (holder) holder.classList.remove("hidden");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  onPreview?.(item.imageUrl, item.title);
              }}
            />
          ) : null}

          <div
            className={`no-image ${
              item.imageUrl ? "hidden" : ""
            } h-12 w-12 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500`}
          >
            No Image
          </div>

          <div className="gap-y-1 flex flex-1 flex-col min-w-0">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.title}
            </div>
            <div
              className="text-xs text-slate-500 line-clamp-1"
              dangerouslySetInnerHTML={{ __html: item.summary }}
            />
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-slate-600">{item.date || "-"}</td>
      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
      </td>
      <td className="py-4 px-3">
        <StatusBadge value={item.status} />
      </td>
      <td className="py-4 pr-6 pl-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title={canEdit ? "Edit" : "Only author can edit"}
            disabled={!canEdit}
            onClick={() => canEdit && onEdit(item)}
            className={`grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-sky-100 ${
              !canEdit ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <Pencil className="h-4 w-4 text-slate-700 cursor-pointer hover:text-sky-600" />
          </button>
          <button
            type="button"
            title={canEdit ? "Delete" : "Only author can delete"}
            disabled={!canEdit}
            onClick={() => canEdit && onDelete(item)}
            className={`grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-rose-100 ${
              !canEdit ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <Trash2 className="h-4 w-4 text-slate-700 hover:text-rose-600 cursor-pointer" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CsrTable() {
  const [me, setMe] = useState(null);
  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    totalCsr: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // get current user (buat author check)
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data.user))
      .catch(() => setMe(null));
  }, []);

  const buildImageUrl = (image) => {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    if (!ASSET_BASE) return "";
    const rel = image.includes("/") ? image : `csr/${image}`;
    return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
  };

  const summarize = (html, max = 80) => {
    const txt = html
      ? html
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : "";
    return txt.length > max ? `${txt.slice(0, max)}…` : txt;
  };

  const fetchList = async ({
    pageArg = page,
    sizeArg = size,
    searchArg = search,
  }) => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/upload/csr", {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
      });

      const { csrs, totalCsr, totalPages, currentPage } = data.data;

      const mapped = (csrs || []).map((c, i) => ({
        ...c,
        rowNo: (currentPage - 1) * sizeArg + i + 1,
        date: c.date?.slice(0, 10),
        imageUrl: c.imageUrl || buildImageUrl(c.image),
        summary: summarize(c.content),
      }));

      setRows(mapped);
      setMeta({ totalCsr, totalPages, currentPage });
    } catch (e) {
      if (e?.response?.status === 404) {
        setRows([]);
        setMeta({ totalCsr: 0, totalPages: 1, currentPage: 1 });
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

  const onEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };
  const onAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };
  const onDelete = async (item) => {
    if (!confirm(`Delete CSR "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/csr/${item.id}`);
      fetchList({ pageArg: 1, sizeArg: size, searchArg: search });
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  const openPreview = (src, alt = "") => {
    if (!src) return;
    setPreview({ open: true, src, alt });
  };
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });

  // tutup dengan ESC + kunci scroll saat modal terbuka
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (preview.open) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = prev || "";
    }
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [preview.open]);

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
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800 cursor-pointer"
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
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm hover:bg-slate-50 cursor-pointer"
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

          {/* Add Post */}
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-4 w-4 " /> Add Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Post</th>
              <th className="py-3 px-3 text-left font-semibold">Date</th>
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
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading posts…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No CSR posts found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((item) => (
                <CsrRow
                  key={item.id}
                  item={item}
                  me={me}
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
          <span className="font-medium">{meta.totalCsr}</span> posts
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.currentPage === 1}
            className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            Previous
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-8 cursor-pointer w-8 rounded-md grid place-content-center text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                n === page
                  ? "bg-sky-500 text-white hover:text-sky-500 ring-sky-500"
                  : ""
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={meta.currentPage === meta.totalPages}
            className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Form */}
      <CsrFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList({ pageArg: 1, sizeArg: size, searchArg: "" });
        }}
      />

      {preview.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.src}
              alt={preview.alt}
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between text-slate-200">
              <div className="text-sm line-clamp-1">
                {preview.alt || "Preview"}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={preview.src}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                >
                  Open in new tab
                </a>
                <button
                  onClick={closePreview}
                  className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
                  aria-label="Close preview"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
