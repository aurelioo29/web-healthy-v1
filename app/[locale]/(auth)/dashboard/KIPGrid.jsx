// components/dashboard/KPIGrid.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users2,
  Tag,
  FlaskConical,
  ShoppingBag,
  Activity as ActivityIcon,
} from "lucide-react";
import api from "@/lib/axios";

const BRAND = "#4698E3";

/* ---------- helpers ---------- */
const fmtInt = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

function useCountUp(target = 0, { duration = 1200 } = {}) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  const to = Number(target || 0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = fromRef.current;
    const run = (t) => {
      const p = Math.min(1, (t - start) / duration);
      // easing (easeOutCubic)
      const e = 1 - Math.pow(1 - p, 3);
      const now = Math.round(from + (to - from) * e);
      setVal(now);
      if (p < 1) raf = requestAnimationFrame(run);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return val;
}

const Card = ({ icon: Icon, label, value, loading }) => {
  const n = useCountUp(loading ? 0 : value, { duration: 1100 });
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 text-center">
      <div
        className="mx-auto mb-3 grid h-12 w-12 place-content-center rounded-xl"
        style={{ background: "#E8F1FE" }}
      >
        <Icon className="h-6 w-6" style={{ color: BRAND }} />
      </div>
      <div className="text-slate-600 text-sm">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {fmtInt(n)}
      </div>
    </div>
  );
};

/* ---------- main grid ---------- */
export default function KPIGrid() {
  const [loading, setLoading] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCatArticles, setTotalCatArticles] = useState(0);
  const [totalCatLab, setTotalCatLab] = useState(0);
  const [totalCatCatalog, setTotalCatCatalog] = useState(0);
  const [totalWeekActivity, setTotalWeekActivity] = useState(0);

  // util: ambil total dari berbagai bentuk payload
  const pickTotal = (
    res,
    keys = ["total", "totalUser", "totalCategories", "totalLogs"]
  ) => {
    const data = res?.data?.data || res?.data || {};
    for (const k of keys)
      if (Number.isFinite(Number(data[k]))) return Number(data[k]);
    // fallback kalau hanya ada array + meta
    if (Array.isArray(data.categories)) return data.categories.length;
    if (Array.isArray(data.logs)) return data.logs.length;
    if (Array.isArray(data.items)) return data.items.length;
    return 0;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        const today = new Date();
        const from = new Date(today);
        from.setDate(from.getDate() - 7);

        const [u, catArt, catLab, catCat, logs] = await Promise.all([
          api.get("/users", { params: { page: 1, size: 1 } }).catch(() => null),
          api
            .get("/category-articles", { params: { page: 1, size: 1 } })
            .catch(() => null),
          api
            .get("/upload/category-lab-tests", { params: { page: 1, size: 1 } })
            .catch(() => null),
          api
            .get("/upload/category-catalogs", { params: { page: 1, size: 1 } })
            .catch(() => null),
          // ganti param tanggal sesuai API-mu kalau beda
          api
            .get("/activity-logs", {
              params: {
                page: 1,
                size: 1,
                date_from: from.toISOString().slice(0, 10),
                date_to: today.toISOString().slice(0, 10),
              },
            })
            .catch(() => null),
        ]);

        if (!mounted) return;

        setTotalUsers(pickTotal(u, ["totalUser", "total"]));
        setTotalCatArticles(pickTotal(catArt, ["totalCategories", "total"]));
        setTotalCatLab(pickTotal(catLab, ["totalCategories", "total"]));
        setTotalCatCatalog(pickTotal(catCat, ["totalCategories", "total"]));
        setTotalWeekActivity(pickTotal(logs, ["totalLogs", "total"]));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card
        icon={Users2}
        label="Total Users"
        value={totalUsers}
        loading={loading}
      />
      <Card
        icon={Tag}
        label="Total Category Articles"
        value={totalCatArticles}
        loading={loading}
      />
      <Card
        icon={FlaskConical}
        label="Total Category Lab Test"
        value={totalCatLab}
        loading={loading}
      />
      <Card
        icon={ShoppingBag}
        label="Total Category E-Catalog"
        value={totalCatCatalog}
        loading={loading}
      />
      <Card
        icon={ActivityIcon}
        label="Total Activity (7 days)"
        value={totalWeekActivity}
        loading={loading}
      />
    </div>
  );
}
