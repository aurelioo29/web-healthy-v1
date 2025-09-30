"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "@/lib/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BRAND = "#4698E3";

/* ---------- helpers ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const ymd = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dmyShort = (d) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);

function getLastNDays(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(now.getDate() - i);
    arr.push({
      key: ymd(dt), // YYYY-MM-DD (kunci agregasi)
      label: dmyShort(dt), // “01 Jan”
    });
  }
  return arr;
}

/* ---------- component ---------- */
export default function ActivityBarChart() {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]); // [{date:'YYYY-MM-DD', count: number}]
  const days = 14;

  const range = useMemo(() => getLastNDays(days), [days]);
  const dateFrom = range[0].key;
  const dateTo = range[range.length - 1].key;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Ambil log 14 hari terakhir. Atur param sesuai API-mu
        const res = await api.get("/activity-logs", {
          params: {
            date_from: dateFrom,
            date_to: dateTo,
            size: 1000, // asumsikan cukup menampung log 14 hari
            page: 1,
            sortBy: "created_at",
            sortDir: "ASC",
          },
        });

        const logs = res?.data?.data?.logs || res?.data?.data || [];
        // hitung jumlah per hari (key = YYYY-MM-DD)
        const bucket = new Map(range.map((d) => [d.key, 0]));
        (Array.isArray(logs) ? logs : []).forEach((l) => {
          const key = ymd(new Date(l.created_at || l.createdAt || l.date));
          if (bucket.has(key)) bucket.set(key, bucket.get(key) + 1);
        });

        if (!mounted) return;
        setSeries(
          range.map((d) => ({ date: d.key, count: bucket.get(d.key) }))
        );
      } catch {
        if (!mounted) return;
        // fallback kosong
        setSeries(range.map((d) => ({ date: d.key, count: 0 })));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  // data untuk Chart.js
  const data = {
    labels: range.map((d) => d.label),
    datasets: [
      {
        label: "Events",
        data: range.map((d, i) => series[i]?.count ?? 0),
        backgroundColor: BRAND,
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} activity`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          precision: 0, // biar integer
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Activity (Last 14 Days)
        </h2>
        <span className="text-xs text-slate-500">
          {dateFrom} – {dateTo}
        </span>
      </div>

      {/* Container scroll-x untuk mobile */}
      <div className="overflow-x-auto">
        {/* min-w biar di layar kecil bisa di-scroll; atur sesuai selera */}
        <div className="min-w-[760px] h-[320px] md:h-[380px] px-4 pb-5">
          <Bar data={data} options={options} />
        </div>
      </div>

      {loading && (
        <div className="px-5 pb-5 text-sm text-slate-500">Loading…</div>
      )}
    </div>
  );
}
