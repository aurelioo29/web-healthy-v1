"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";

// ====== Helpers ======
const BRAND = "#4698E3";

const toJakartaYMD = (s) => {
  if (!s) return "";
  const d = new Date(s);
  // YYYY-MM-DD di Asia/Jakarta
  const y = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(d);
  const m = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    month: "2-digit",
  }).format(d);
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
  }).format(d);
  return `${y}-${m}-${day}`;
};

const toJakartaYMDHMS = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const ymd = toJakartaYMD(d);
  const hh = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    hour12: false,
  }).format(d);
  const mm = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  const ss = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return `${ymd} ${hh}:${mm}:${ss}`;
};

// Modal detail sederhana
function DetailModal({ open, onClose, item }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Log Detail</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-3">
            <div className="text-slate-500">ID</div>
            <div className="col-span-2">{item?.id}</div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">User</div>
            <div className="col-span-2">
              {item?.User?.username} ({item?.user_id})
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">Action</div>
            <div className="col-span-2">{item?.action}</div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">Resource</div>
            <div className="col-span-2">
              {item?.resource}
              {item?.resource_id ? ` #${item.resource_id}` : ""}
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">When</div>
            <div className="col-span-2">
              {toJakartaYMDHMS(item?.created_at)}
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">IP</div>
            <div className="col-span-2">{item?.ipAddress || "-"}</div>
          </div>
          <div className="grid grid-cols-3">
            <div className="text-slate-500">User Agent</div>
            <div className="col-span-2 break-words">
              {item?.userAgent || "-"}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Description</div>
            <div className="mt-1 whitespace-pre-wrap">
              {item?.description || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Row ======
function LogRow({ item, onView }) {
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="py-3 pl-6 pr-3 text-slate-700">{item.rowNo}</td>
      <td className="py-3 px-3 text-slate-700">
        {item.username || `#${item.user_id}`}
      </td>
      <td className="py-3 px-3 text-slate-600">{item.action}</td>
      <td className="py-3 px-3 text-slate-600">
        <div
          className="line-clamp-1"
          title={`${item.resource}${
            item.resource_id ? ` #${item.resource_id}` : ""
          }`}
        >
          {item.resource}
          {item.resource_id ? ` #${item.resource_id}` : ""}
        </div>
      </td>
      <td className="py-3 px-3 text-slate-600">{item.when}</td>
      <td className="py-3 pr-6 pl-3">
        <div className="flex justify-end">
          <button
            onClick={() => onView(item)}
            className="grid h-8 w-8 place-content-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50"
            title="View"
          >
            <Eye className="h-4 w-4 text-slate-700" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ====== Main Table ======
export default function ActivityLogsTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    totalLogs: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // query state
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState(""); // YYYY-MM-DD
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("DESC");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // detail modal
  const [detail, setDetail] = useState({ open: false, item: null });

  const fetchList = async (params = {}) => {
    setLoading(true);
    setErr("");
    try {
      const q = {
        page,
        size,
        sortBy,
        sortDir,
      };
      if (search) q.search = search;
      if (userId) q.userId = userId;
      if (action) q.action = action;
      if (resource) q.resource = resource;
      if (dateFrom) q.date_from = dateFrom;
      if (dateTo) q.date_to = dateTo;

      const { data } = await api.get("/activity-logs", { params: q });

      const { logs, totalLogs, totalPages, currentPage } = data.data || {};
      const mapped = (logs || []).map((l, i) => ({
        ...l,
        rowNo: (currentPage - 1) * size + i + 1,
        username: l.User?.username || null,
        when: toJakartaYMDHMS(l.created_at),
      }));

      setRows(mapped);
      setMeta({
        totalLogs: totalLogs || 0,
        totalPages: totalPages || 1,
        currentPage: currentPage || 1,
      });
    } catch (e) {
      if (e?.response?.status === 404) {
        setRows([]);
        setMeta({ totalLogs: 0, totalPages: 1, currentPage: 1 });
      } else {
        setErr(e?.response?.data?.message || e.message || "Failed to load");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy, sortDir]);

  const applyFilter = () => {
    setPage(1);
    fetchList();
  };

  const resetFilter = () => {
    setSearch("");
    setUserId("");
    setAction("");
    setResource("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    // fetch fresh
    setTimeout(fetchList, 0);
  };

  const toggleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDir("ASC");
    } else {
      setSortDir((d) => (d === "ASC" ? "DESC" : "ASC"));
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Filters */}
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilter()}
                placeholder="Search (action/resource/description/username)…"
                className="pl-9 pr-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm w-64"
              />
            </div>

            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm w-28"
            />

            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Action"
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm w-40"
            />

            <input
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              placeholder="Resource"
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm w-40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm"
              title="From (YYYY-MM-DD)"
            />
            <span className="text-slate-500 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg ring-1 ring-slate-200 focus:ring-sky-400 outline-none text-sm"
              title="To (YYYY-MM-DD)"
            />

            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg ring-1 ring-slate-200 px-2 py-2 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <button
              onClick={applyFilter}
              className="px-3 py-2 rounded-lg text-white text-sm"
              style={{ background: BRAND }}
            >
              Apply
            </button>
            {(search || userId || action || resource || dateFrom || dateTo) && (
              <button
                onClick={resetFilter}
                className="px-3 py-2 rounded-lg ring-1 ring-slate-200 text-sm hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left font-semibold">#</th>
              <th
                className="py-3 px-3 text-left font-semibold cursor-pointer select-none"
                onClick={() => toggleSort("user_id")}
              >
                User{" "}
                {sortBy === "user_id" ? (sortDir === "ASC" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 px-3 text-left font-semibold">Action</th>
              <th className="py-3 px-3 text-left font-semibold">Resource</th>
              <th
                className="py-3 px-3 text-left font-semibold cursor-pointer select-none"
                onClick={() => toggleSort("created_at")}
              >
                When{" "}
                {sortBy === "created_at" ? (sortDir === "ASC" ? "↑" : "↓") : ""}
              </th>
              <th className="py-3 pr-6 pl-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading logs…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No activity logs found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((item) => (
                <LogRow
                  key={item.id}
                  item={item}
                  onView={(row) => setDetail({ open: true, item: row })}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 text-sm text-slate-600">
        <p>
          Showing <span className="font-medium">{rows.length}</span> of{" "}
          <span className="font-medium">{meta.totalLogs}</span> logs
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.currentPage === 1}
            className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4 inline-block" /> Previous
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
            Next <ChevronRight className="h-4 w-4 inline-block" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={detail.open}
        item={detail.item}
        onClose={() => setDetail({ open: false, item: null })}
      />
    </div>
  );
}
