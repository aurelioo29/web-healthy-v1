"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CatalogFormModal from "./CatalogFormModal";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";

const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const buildImageUrl = (image, imageUrlFromBE, folder = "catalogs") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const money = (amount, currency = "IDR") => {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return new Intl.NumberFormat("id-ID").format(n) + " " + currency;
  }
};

const toYMD = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

function StatusBadge({ value }) {
  const cls =
    value === "published"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";
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

function PriceCell({ original, discount, currency }) {
  const po = Number(original || 0);
  const pd = Number(discount || 0);
  if (pd > 0 && pd < po) {
    return (
      <div className="flex flex-col">
        <span className="text-slate-400 line-through">
          {money(po, currency)}
        </span>
        <span className="font-semibold text-slate-900">
          {money(pd, currency)}
        </span>
      </div>
    );
  }
  return (
    <span className="font-medium text-slate-900">{money(po, currency)}</span>
  );
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
              alt={item.title}
              className="h-16 w-24 rounded object-cover ring-1 ring-slate-200 cursor-zoom-in hover:opacity-90 transition"
              onClick={() => onPreview?.(item.imageUrl, item.title)}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="h-16 w-24 rounded bg-slate-100 ring-1 ring-slate-200 grid place-content-center text-xs text-slate-500">
              No Image
            </div>
          )}

          <div className="min-w-0">
            <div className="font-medium text-slate-900 line-clamp-1">
              {item.title}
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-3 text-slate-600">{toYMD(item.date)}</td>

      <td className="py-4 px-3">
        <PriceCell
          original={item.price_original}
          discount={item.price_discount}
          currency={item.currency || "IDR"}
        />
      </td>

      <td className="py-4 px-3">
        <StatusBadge value={item.status} />
      </td>

      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
      </td>

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

export default function CatalogsTable() {
  const [me, setMe] = useState(null);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1 });

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // ""|"draft"|"published"
  const [categoryId, setCategoryId] = useState("");

  const [cats, setCats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [preview, setPreview] = useState({ open: false, src: "", alt: "" });

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data.user))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    api
      .get("/upload/category-catalogs", { params: { page: 1, size: 500 } })
      .then((res) => setCats(res?.data?.data?.categories || []))
      .catch(() => setCats([]));
  }, []);

  const fetchList = async (pageArg = page, sizeArg = size) => {
    setLoading(true);
    setErr("");
    try {
      const params = {
        page: pageArg,
        size: sizeArg,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
      };
      const { data } = await api.get("/upload/catalogs", { params });

      const { catalogs, totalCatalogs, totalPages, currentPage } = data.data;

      const mapped = (catalogs || []).map((c, i) => ({
        ...c,
        rowNo: (currentPage - 1) * sizeArg + i + 1,
        imageUrl: c.imageUrl || buildImageUrl(c.image),
      }));

      setRows(mapped);
      setMeta({
        total: totalCatalogs ?? mapped.length,
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
    fetchList(page, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, status, categoryId]);

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
      await api.delete(`/upload/catalogs/${item.id}`);
      setPage(1);
      fetchList(1, size);
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.response?.data?.message || e.message || "Delete failed",
      });
    }
  };

  const openPreview = (src, alt = "") => setPreview({ open: true, src, alt });
  const closePreview = () => setPreview({ open: false, src: "", alt: "" });
  ``;

  // lock scroll saat preview
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (preview.open) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = prev || "";
    return () => (document.documentElement.style.overflow = prev || "");
  }, [preview.open]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                fetchList(1, size);
              }
            }}
            placeholder="Search title/content…"
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-[#4698E3] outline-none text-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg ring-1 ring-slate-200 px-2 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg ring-1 ring-slate-200 px-2 py-2 text-sm"
          >
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setPage(1);
              fetchList(1, size);
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Apply
          </button>

          {(search || status || categoryId) && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setCategoryId("");
                setPage(1);
                fetchList(1, size);
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
            New Catalog
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Item</th>
              <th className="py-3 px-3 text-left font-semibold">Date</th>
              <th className="py-3 px-3 text-left font-semibold">Price</th>
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
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No catalog found.
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

      {/* Modal Form */}
      <CatalogFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList(1, size);
        }}
      />

      {/* Preview Modal */}
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
