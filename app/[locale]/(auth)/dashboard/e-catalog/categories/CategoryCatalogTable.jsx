"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import CategoryCatalogFormModal from "./CategoryCatalogModal";

const BRAND = "#4698E3";

const toYMD = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

function Row({ item, me, onEdit, onDelete }) {
  const canEdit = me && item.author_id === me.id;
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>
      <td className="py-4 px-3">
        <div className="font-medium text-slate-900 line-clamp-1">
          {item.name}
        </div>
      </td>
      <td className="py-4 px-3 text-slate-600">
        {item.author?.username || `#${item.author_id}`}
      </td>
      <td className="py-4 px-3 text-slate-600">{toYMD(item.created_at)}</td>
      <td className="py-4 pr-6 pl-3">
        <div className="flex justify-end gap-2">
          <button
            title={canEdit ? "Edit" : "Only author can edit"}
            disabled={!canEdit}
            onClick={() => canEdit && onEdit(item)}
            className={`px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 ${
              !canEdit ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            Edit
          </button>
          <button
            title={canEdit ? "Delete" : "Only author can delete"}
            disabled={!canEdit}
            onClick={() => canEdit && onDelete(item)}
            className={`px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 ${
              !canEdit ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryCatalogsTable() {
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
      const { data } = await api.get("/upload/category-catalogs", {
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
      await api.delete(`/upload/category-catalogs/${item.id}`);
      setPage(1);
      fetchList(1, size, search);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

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
            placeholder="Search name…"
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
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
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

      {/* Modal */}
      <CategoryCatalogFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList(1, size, "");
        }}
      />
    </div>
  );
}
