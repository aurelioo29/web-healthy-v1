"use client";

import React, { useEffect, useState } from "react";
import { Settings, CircleX, Search } from "lucide-react";
import api from "@/lib/axios";
import CreateUserButton from "./UserCreateButton";

const STATUS_STYLE = {
  active: {
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Active",
  },
  inactive: {
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    label: "Inactive",
  },
};

function StatusBadge({ value }) {
  const s = value === "active" ? STATUS_STYLE.active : STATUS_STYLE.inactive;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${s.chip}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Pagination({ page, pages, onChange }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
      >
        Previous
      </button>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
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
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}

export default function UserTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    totalUser: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(6);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchUsers({
    pageArg = page,
    sizeArg = size,
    searchArg = search,
  }) {
    setLoading(true);
    setErr("");

    try {
      const { data } = await api.get("/users", {
        params: {
          page: pageArg,
          size: sizeArg,
          ...(searchArg ? { search: searchArg } : {}),
        },
      });

      const { users, totalUser, totalPages, currentPage } = data.data;

      const normalized = (users || []).map((u) => ({
        id: u.id,
        name: u.name || u.username,
        username: u.username,
        email: u.email,
        role:
          String(u.role || "").toLowerCase() === "superadmin"
            ? "Superadmin"
            : "Admin",
        createdAt: u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-GB")
          : "-",
        // aktif hijau; selain itu oranye
        status:
          (u.status || (u.isVerified ? "active" : "inactive")).toLowerCase() ===
          "active"
            ? "active"
            : "inactive",
        avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(
          u.email || u.username || String(u.id)
        )}`,
      }));

      setRows(normalized);
      setMeta({ totalUser, totalPages, currentPage });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        // controller kamu return 404 kalau kosong
        setRows([]);
        setMeta({ totalUser: 0, totalPages: 1, currentPage: 1 });
      } else {
        setErr(
          e?.response?.data?.message || e.message || "Failed to load users"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers({ pageArg: page, sizeArg: size, searchArg: search });
  }, [page, size]);

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
                  fetchUsers({
                    pageArg: 1,
                    sizeArg: size,
                    searchArg: e.currentTarget.value,
                  });
                }
              }}
              placeholder="Search username / name…"
              className="pl-9 pr-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              setPage(1);
              fetchUsers({ pageArg: 1, sizeArg: size, searchArg: search });
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
                fetchUsers({ pageArg: 1, sizeArg: size, searchArg: "" });
              }}
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm hover:bg-slate-50"
            >
              Reset
            </button>
          )}

          <div className="flex items-center gap-2">
            <CreateUserButton
              onSuccess={() =>
                fetchUsers({ pageArg: 1, sizeArg: size, searchArg: "" })
              }
            />
          </div>
        </div>

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th className="py-3 px-3 text-left font-semibold">Name</th>
              <th className="py-3 px-3 text-left font-semibold">
                Date Created
              </th>
              <th className="py-3 px-3 text-left font-semibold">Role</th>
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
                  Loading users… santai, server-mu bukan Usain Bolt.
                </td>
              </tr>
            )}

            {empty && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="py-4 pl-6 pr-3 text-slate-700">
                    {(meta.currentPage - 1) * size + idx + 1}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-medium text-slate-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-600">{u.createdAt}</td>
                  <td className="py-4 px-3 text-slate-700">{u.role}</td>
                  <td className="py-4 px-3">
                    <StatusBadge value={u.status} />
                  </td>
                  <td className="py-4 pr-6 pl-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        title="Settings"
                        className="rounded-lg p-2 text-sky-600 hover:bg-sky-100 cursor-pointer"
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <CircleX size={18} />
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
          <span className="font-medium">{meta.totalUser}</span> entries
        </p>
        <Pagination
          page={meta.currentPage}
          pages={meta.totalPages}
          onChange={(n) => setPage(n)}
        />
      </div>

      {err && <div className="px-6 pb-4 text-sm text-rose-600">{err}</div>}
    </div>
  );
}
