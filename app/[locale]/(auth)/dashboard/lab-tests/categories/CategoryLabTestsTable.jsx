"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CategoryLabTestFormModal from "./CategoryLabTestFormModal";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

const BRAND = "#4698E3";

function toYMD(s) {
  if (!s) return "";
  const d = new Date(s);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function summarize(html, max = 120) {
  const txt = html
    ? html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  return txt.length > max ? `${txt.slice(0, max)}…` : txt;
}

function Row({ item, me, onEdit, onDelete, onPreview }) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-14 w-20 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
              onClick={() => onPreview?.(item.imageUrl, item.name)}
              onError={(e) => (e.currentTarget.style.display = "none")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  onPreview?.(item.imageUrl, item.name);
              }}
            />
          ) : (
            <div className="h-14 w-20 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500">
              No Image
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.name}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-3 text-slate-600">
        {summarize(item.description)}
      </td>
      <td className="py-4 px-3 text-slate-600">
        {item.authorUsername || `#${item.author_id}`}
      </td>
      <td className="py-4 px-3 text-slate-600">{toYMD(item.created_at)}</td>
      <td className="py-4 pr-6 pl-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title={"Edit"}
            onClick={() => onEdit(item)}
            className="grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-sky-100"
          >
            <Pencil className="h-4 w-4 text-slate-700 cursor-pointer hover:text-sky-600" />
          </button>
          <button
            type="button"
            title={"Delete"}
            onClick={() => onDelete(item)}
            className="grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4 text-slate-700 hover:text-rose-600 cursor-pointer" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryLabTestsTable() {
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // preview image state
  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data.user))
      .catch(() => setMe(null));
  }, []);

  const fetchList = async (
    pageArg = page,
    sizeArg = size,
    searchArg = search
  ) => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/upload/category-lab-tests", {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
      });

      const { categories, totalCategories, totalPages, currentPage } =
        data.data;

      const mapped = (categories || []).map((c, i) => ({
        ...c,
        rowNo: (currentPage - 1) * sizeArg + i + 1,
        authorUsername: c.author?.username || c.User?.username || null,
      }));

      setRows(mapped);
      setMeta({
        total: totalCategories ?? mapped.length,
        totalPages: Math.max(totalPages || 1, 1),
        currentPage: currentPage || pageArg,
      });
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
    fetchList(page, size, search);
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
    if (!confirm(`Delete category "${item.name}"? This cannot be undone.`))
      return;
    try {
      await api.delete(`/upload/category-lab-tests/${item.id}`);
      setPage(1);
      fetchList(1, size, search);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  // preview helpers
  const openPreview = (src, alt = "") => {
    if (!src) return;
    setPreview({ open: true, src, alt });
  };
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });

  // ESC + lock scroll saat preview terbuka
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closePreview();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = preview.open
      ? "hidden"
      : prev || "";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [preview.open]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                fetchList(1, size, e.currentTarget.value);
              }
            }}
            placeholder="Search name/description…"
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-[#4698E3] outline-none text-sm"
          />
          <button
            onClick={() => {
              setPage(1);
              fetchList(1, size, search);
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
                fetchList(1, size, "");
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
            New Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Category</th>
              <th className="py-3 px-3 text-left font-semibold">Description</th>
              <th className="py-3 px-3 text-left font-semibold">Author</th>
              <th className="py-3 px-3 text-left font-semibold">Created</th>
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
                  No categories found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((item) => (
                <Row
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

      {/* Footer paging */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 text-sm text-slate-600">
        <p>
          Showing <span className="font-medium">{rows.length}</span> of{" "}
          <span className="font-medium">{meta.total}</span> categories
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
                n === meta.currentPage ? "text-white" : "text-slate-700"
              }`}
              style={
                n === meta.currentPage
                  ? { background: BRAND, borderColor: BRAND }
                  : {}
              }
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
      <CategoryLabTestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList(1, size, "");
        }}
      />

      {/* Preview modal */}
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
      )}
    </div>
  );
}
