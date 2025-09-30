"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const BRAND = "#4698E3";

/* -------------------------------------------
   Helpers
------------------------------------------- */
const fmtInt = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const pickTotal = (res) => {
  // Tries to read any "total*" field in res.data.data
  const d = res?.data?.data || {};
  for (const k of Object.keys(d)) {
    if (/^total/i.test(k) && typeof d[k] === "number") return d[k];
  }
  // Fallback: if list exists, use its length
  for (const k of Object.keys(d)) {
    if (Array.isArray(d[k])) return d[k].length;
  }
  return 0;
};

/* -------------------------------------------
   Center Text Plugin (no React prop leakage)
------------------------------------------- */
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart, _args, pluginOptions) {
    const { ctx, chartArea } = chart;
    const {
      text,
      font = "600 16px Inter, system-ui",
      color = "#0f172a",
    } = pluginOptions || {};
    if (text === undefined || text === null) return;

    let cx, cy;
    try {
      const meta = chart.getDatasetMeta(0);
      cx = meta?.data?.[0]?.x;
      cy = meta?.data?.[0]?.y;
    } catch (_) {
      /* noop */
    }
    if (cx == null || cy == null) {
      cx = (chartArea.left + chartArea.right) / 2;
      cy = (chartArea.top + chartArea.bottom) / 2;
    }

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(text), cx, cy);
    ctx.restore();
  },
};

/* -------------------------------------------
   Card component
------------------------------------------- */
function PieStatCard({ title, published = 0, draft = 0, loading = false }) {
  const total = Number(published || 0) + Number(draft || 0);

  const data = {
    labels: ["Published", "Draft"],
    datasets: [
      {
        data: [published, draft],
        backgroundColor: [BRAND, "#E2E8F0"],
        borderWidth: 0,
        hoverOffset: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      // 👇 pass text via plugin options (NOT as a React prop)
      centerText: { text: loading ? "…" : fmtInt(total) },
      tooltip: {
        callbacks: {
          label: ({ label, raw }) => `${label}: ${fmtInt(raw)}`,
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="px-2 pt-2">
        <div className="relative h-[200px]">
          <Doughnut
            data={data}
            options={options}
            plugins={[centerTextPlugin]}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: BRAND }}
          />
          <span className="text-slate-600">Published</span>
        </div>
        <div className="text-right font-medium text-slate-900">
          {loading ? "…" : fmtInt(published)}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "#E2E8F0" }}
          />
          <span className="text-slate-600">Draft</span>
        </div>
        <div className="text-right font-medium text-slate-900">
          {loading ? "…" : fmtInt(draft)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------
   Grid wrapper (fetches counts)
------------------------------------------- */
export default function PieStatsGrid() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState({ published: 0, draft: 0 });
  const [labtests, setLabtests] = useState({ published: 0, draft: 0 });
  const [catalogs, setCatalogs] = useState({ published: 0, draft: 0 });
  const [csr, setCsr] = useState({ published: 0, draft: 0 });

  useEffect(() => {
    let active = true;

    const fetchPair = async (path) => {
      const [pub, dra] = await Promise.allSettled([
        api.get(path, { params: { size: 1, page: 1, status: "published" } }),
        api.get(path, { params: { size: 1, page: 1, status: "draft" } }),
      ]);

      const published = pub.status === "fulfilled" ? pickTotal(pub.value) : 0;
      const draft = dra.status === "fulfilled" ? pickTotal(dra.value) : 0;
      return { published, draft };
    };

    (async () => {
      setLoading(true);
      try {
        const [a, l, c, s] = await Promise.all([
          fetchPair("/upload/articles"),
          fetchPair("/upload/lab-tests"),
          fetchPair("/upload/catalogs"),
          fetchPair("/upload/csr"),
        ]);
        if (!active) return;
        setArticles(a);
        setLabtests(l);
        setCatalogs(c);
        setCsr(s);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PieStatCard
        title="Articles"
        published={articles.published}
        draft={articles.draft}
        loading={loading}
      />
      <PieStatCard
        title="Lab Tests"
        published={labtests.published}
        draft={labtests.draft}
        loading={loading}
      />
      <PieStatCard
        title="Catalogs"
        published={catalogs.published}
        draft={catalogs.draft}
        loading={loading}
      />
      <PieStatCard
        title="CSR"
        published={csr.published}
        draft={csr.draft}
        loading={loading}
      />
    </div>
  );
}
