"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Users2,
  FileText,
  Tag,
  Activity,
  Plus,
  ClipboardList,
  Shield,
} from "lucide-react";

/* ===== Chart.js setup ===== */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import KPIGrid from "./KIPGrid";
import ActivityBarChart from "./ActivityBarChart";
import PieStatsGrid from "./PieStatsGrid";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const BRAND = "#4698E3";

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </div>
);

const Stat = ({ icon: Icon, label, value, hint }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 place-content-center rounded-xl ring-1 ring-slate-200"
        style={{ background: "#F3F8FE" }}
      >
        <Icon className="h-5 w-5" style={{ color: BRAND }} />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-slate-600">{label}</div>
        <div
          className="text-2xl font-semibold tracking-tight"
          style={{ color: BRAND }}
        >
          {value ?? "—"}
        </div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
    </div>
  </Card>
);

const RecentItem = ({ log }) => {
  const color =
    log.action === "DELETE"
      ? "bg-rose-500"
      : log.action === "UPDATE"
      ? "bg-sky-500"
      : "bg-emerald-500";
  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      <div className="min-w-0">
        <div className="text-sm text-slate-900">
          <span className="font-medium">
            {log.User?.username || `#${log.user_id}`}
          </span>{" "}
          <span className="text-slate-600">{log.action}</span>{" "}
          <code className="text-slate-600">
            {log.resource}
            {log.resource_id ? `#${log.resource_id}` : ""}
          </code>
        </div>
        <div className="text-xs text-slate-500">{log.when}</div>
        {log.description ? (
          <div className="text-xs text-slate-600 line-clamp-1">
            {log.description}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const toJakartaHMS = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const dt = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return dt.replace(/,/g, "");
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // stats
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalCSR, setTotalCSR] = useState(null);
  const [totalCategories, setTotalCategories] = useState(null);

  // recent
  const [recent, setRecent] = useState([]);

  // for charts
  const [csrList, setCsrList] = useState([]);
  const [articleCats, setArticleCats] = useState([]); // [{name, count}]
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMe(res.data?.user))
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const [u, c, cat, logs, csrAll, catsAll] = await Promise.all([
          api.get("/users", { params: { size: 1, page: 1 } }).catch(() => null),
          api
            .get("/upload/csr", { params: { size: 1, page: 1 } })
            .catch(() => null),
          api
            .get("/category-articles", { params: { size: 1, page: 1 } })
            .catch(() => null),
          api
            .get("/activity-logs", {
              // ambil banyak dikit biar line chartnya mantap
              params: { size: 300, sortBy: "created_at", sortDir: "DESC" },
            })
            .catch(() => null),
          api
            .get("/upload/csr", { params: { size: 500, page: 1 } })
            .catch(() => null),
          api
            .get("/category-articles", { params: { size: 200, page: 1 } })
            .catch(() => null),
        ]);

        if (!mounted) return;

        setTotalUsers(u?.data?.data?.totalUser ?? 0);
        setTotalCSR(c?.data?.data?.totalCsr ?? 0);
        setTotalCategories(cat?.data?.data?.totalCategories ?? 0);

        const logsData = logs?.data?.data?.logs || [];
        setRecent(
          logsData
            .slice(0, 5)
            .map((l) => ({ ...l, when: toJakartaHMS(l.created_at) }))
        );
        setActivityLogs(logsData);

        // csr list for doughnut (published vs draft)
        const csrItems =
          csrAll?.data?.data?.csr ||
          csrAll?.data?.data?.items ||
          csrAll?.data?.data?.rows ||
          [];
        setCsrList(csrItems);

        // article categories for bar chart
        let catRows =
          catsAll?.data?.data?.categories ??
          catsAll?.data?.data?.rows ??
          catsAll?.data?.data ??
          [];

        if (!Array.isArray(catRows)) catRows = [];
        setArticleCats(
          catRows.map((r) => ({
            name: r.name ?? "Unknown",
            count: Number(r.article_count ?? r.total_articles ?? r.count ?? 0),
          }))
        );
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Gagal memuat dashboard"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  /* ===== CHARTS: transformers ===== */
  // Line: activity 14 hari terakhir (semua logs)
  const activity14 = useMemo(() => {
    const days = 14;
    const labels = [];
    const map = new Map();
    // seed tanggal kosong dulu
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(
        new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
        }).format(d)
      );
      map.set(key, 0);
    }
    (activityLogs || []).forEach((l) => {
      const key = new Date(l.created_at).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, map.get(key) + 1);
    });
    return {
      labels,
      data: Array.from(map.values()),
    };
  }, [activityLogs]);

  // Doughnut: CSR status split
  const csrStatus = useMemo(() => {
    let published = 0;
    let draft = 0;
    (csrList || []).forEach((x) =>
      String(x.status) === "published" ? (published += 1) : (draft += 1)
    );
    return { published, draft };
  }, [csrList]);

  // Bar: Artikel per Kategori (top 8)
  const catBar = useMemo(() => {
    const sorted = [...(articleCats || [])]
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 8);
    return {
      labels: sorted.map((s) => s.name),
      data: sorted.map((s) => s.count ?? 0),
    };
  }, [articleCats]);

  if (!me) {
    return (
      <div className="min-h-[60vh] grid place-content-center text-slate-600">
        {loading ? "Loading…" : "Redirecting…"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Halo, {me.username}
          </h1>
          <p className="text-sm text-slate-600">
            Login with role{" "}
            <span className="font-bold">
              {me.role === "superadmin" ? "Superadmin" : "Admin"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/csr"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white text-sm font-medium"
            style={{ background: BRAND }}
          >
            <Plus className="h-4 w-4" /> Add CSR
          </Link>
          {me.role === "superadmin" && (
            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <Shield className="h-4 w-4" /> Manage Users
            </Link>
          )}
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      {/* Stats */}
      <KPIGrid />

      {/* ===== CHARTS GRID ===== */}
      <ActivityBarChart />

      <PieStatsGrid />

      {/* Two columns */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Recent Activity */}
        <Card className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Activity
            </h2>
            {me.role === "superadmin" ? (
              <Link
                href="/dashboard/activity-logs"
                className="text-sm font-medium"
                style={{ color: BRAND }}
              >
                View all
              </Link>
            ) : null}
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {!loading && recent.length === 0 && (
              <div className="py-10 text-sm text-slate-500 text-center">
                No activity yet.
              </div>
            )}
            {loading && (
              <div className="py-10 text-sm text-slate-500 text-center">
                Loading logs…
              </div>
            )}
            {!loading &&
              recent.map((log) => <RecentItem key={log.id} log={log} />)}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="lg:col-span-4 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Quick Actions
          </h2>
          <div className="mt-3 grid gap-2">
            <Link
              href="/dashboard/csr"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" /> Manage CSR
            </Link>
            <Link
              href="/dashboard/articles"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Manage Articles
            </Link>
            <Link
              href="/dashboard/category-articles"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <Tag className="h-4 w-4" /> Manage Categories Articles
            </Link>
            <Link
              href="/dashboard/lab-tests"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Manage Lab Test Laboratorium
            </Link>
            <Link
              href="/dashboard/lab-tests/categories"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <Tag className="h-4 w-4" /> Manage Categories Lab Test
              Laboratorium
            </Link>
            <Link
              href="/dashboard/e-catalog"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Manage E-Catalog
            </Link>
            <Link
              href="/dashboard/e-catalog/categories"
              className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
            >
              <Tag className="h-4 w-4" /> Manage Categories E-Catalog
            </Link>
            {me.role === "superadmin" && (
              <>
                <Link
                  href="/dashboard/users"
                  className="rounded-lg px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 text-sm inline-flex items-center gap-2"
                >
                  <Users2 className="h-4 w-4" /> Manage Users
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
