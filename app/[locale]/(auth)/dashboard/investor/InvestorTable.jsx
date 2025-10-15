"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import InvestorFormModal from "./InvestorFormModal";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";

const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const buildFileUrl = (file, fileUrlFromBE, folder = "investors") => {
  if (fileUrlFromBE) return fileUrlFromBE;
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  if (!ASSET_BASE) return "";
  const rel = file.includes("/") ? file : `${folder}/${file}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
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

function Row({ item, me, onEdit, onDelete }) {
  const fileName =
    item.fileName ||
    item.file ||
    (item.fileUrl ? item.fileUrl.split("/").pop() : "");

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-4 pl-6 pr-3 text-slate-700">{item.rowNo}</td>

      <td className="py-4 px-3">
        <div className="min-w-0">
          <div className="font-medium text-slate-900 line-clamp-1">
            {item.title}
          </div>
          <div className="text-xs text-slate-500 line-clamp-1">
            {item.category?.name || `#${item.category_id}`}
          </div>
        </div>
      </td>

      <td className="py-4 px-3 text-slate-600">{toYMD(item.date)}</td>

      <td className="py-4 px-3">
        <StatusBadge value={item.status} />
      </td>

      <td className="py-4 px-3">
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            title={fileName || "Download PDF"}
          >
            Download PDF
          </a>
        ) : (
          <span className="text-xs text-slate-400">No file</span>
        )}
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

export default function InvestorsTable() {
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

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setMe(res.data.user))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    api
      .get("/upload/category-investors", { params: { page: 1, size: 500 } })
      .then((res) => {
        const box = res?.data?.data || {};
        setCats(
          box.categories ||
            box.category_investors ||
            box.items ||
            box.rows ||
            []
        );
      })
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
      const { data } = await api.get("/upload/investors", { params });

      // ==== robust unwrap ====
      const box = data?.data || {};
      const list = box.investors || box.items || box.rows || [];
      const total = box.totalInvestors ?? box.total ?? list.length;
      const currentPage = box.currentPage ?? pageArg ?? 1;
      const totalPages =
        box.totalPages ??
        (sizeArg ? Math.max(1, Math.ceil((total || 0) / sizeArg)) : 1);

      const mapped = (list || []).map((c, i) => ({
        ...c,
        rowNo: (currentPage - 1) * sizeArg + i + 1,
        fileUrl: c.fileUrl || buildFileUrl(c.file),
      }));

      setRows(mapped);
      setMeta({
        total: total ?? mapped.length,
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
      await api.delete(`/upload/investors/${item.id}`);
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
            New Investor
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
              <th className="py-3 px-3 text-left font-semibold">File</th>
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
                  No investor found.
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
      <InvestorFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editItem ? "edit" : "create"}
        initialData={editItem}
        onSuccess={() => {
          setPage(1);
          fetchList(1, size);
        }}
      />
    </div>
  );
}
