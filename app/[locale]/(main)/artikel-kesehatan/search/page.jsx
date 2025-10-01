"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/artikel-pages/placeholder.png";

const imgUrl = (image, imageUrlFromBE, folder = "articles") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return PLACEHOLDER;
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const getCategoryName = (a) =>
  a?.category?.name ||
  a?.Category?.name ||
  (Array.isArray(a?.categories) && a.categories[0]?.name) ||
  a?.categoryName ||
  a?.category_name ||
  "";

const stripTags = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const makeExcerpt = (article, max = 180) => {
  const raw =
    article.excerpt ||
    article.excerptText ||
    article.summary ||
    article.content ||
    "";
  const text = stripTags(raw);
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

const fmtDate = (s) =>
  s
    ? new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(new Date(s))
    : "";

function ArticleCard({ a }) {
  const short = makeExcerpt(a, 180);
  const cat = getCategoryName(a);

  return (
    <a
      href={`/artikel-kesehatan/${a.slug}`}
      className="block rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white hover:shadow transition"
    >
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <img
          src={imgUrl(a.image, a.imageUrl)}
          alt={a.title}
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
        />

        {/* badges kanan-atas */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {cat ? (
            <span className="max-w-auto truncate rounded-full bg-[#4698E3]/95 px-3 py-1 text-[11px] font-semibold text-white shadow">
              {cat.toUpperCase()}
            </span>
          ) : null}

          {a.isLatest ? (
            <span className="max-w-[72%] truncate rounded-full bg-emerald-600/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
              ARTIKEL TERBARU
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold leading-snug text-slate-900 line-clamp-2">
          {a.title}
        </h3>

        {short ? (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{short}</p>
        ) : null}

        <span className="mt-3 inline-block text-sm font-semibold text-sky-700">
          READ MORE »
        </span>

        <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500 flex items-center gap-4">
          <span>
            {fmtDate(a.date || a.created_at)} • <span>No Comments</span>
          </span>
        </div>
      </div>
    </a>
  );
}

export default function SearchPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = (sp.get("q") || "").trim();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const size = 12;

  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ambil dari API yang sama seperti autocomplete, dengan fallback FE filter
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!q) {
        setRows([]);
        setTotalPages(1);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        // 1) normal
        let res = await api.get("/upload/articles", {
          params: { search: q, status: "published", page, size },
        });
        let data = res?.data?.data ?? {};
        let list = data.articles || [];

        // 2) fallback case-sensitivity status (Published)
        if (!list.length) {
          res = await api.get("/upload/articles", {
            params: { search: q, status: "Published", page, size },
          });
          data = res?.data?.data ?? {};
          list = data.articles || [];
        }

        // 3) last-resort FE filter
        if (!list.length) {
          const all = await api.get("/upload/articles", {
            params: { status: "published", page: 1, size: 200 },
          });
          const t = q.toLowerCase();
          const allList = all?.data?.data?.articles || [];
          list = allList.filter((a) => {
            const title = a.title?.toLowerCase() || "";
            const ex = (a.excerpt || "").toLowerCase();
            const body =
              typeof a.content === "string" ? a.content.toLowerCase() : "";
            return title.includes(t) || ex.includes(t) || body.includes(t);
          });
          setTotalPages(1);
        } else {
          setTotalPages(Number(data.totalPages || 1));
        }

        if (!alive) return;
        setRows(list);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Gagal memuat hasil pencarian");
        setRows([]);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [q, page]);

  const pages = useMemo(() => {
    const total = Math.max(1, totalPages);
    const cur = Math.max(1, page);
    const span = 5;
    const half = Math.floor(span / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, start + span - 1);
    if (end - start + 1 < span) start = Math.max(1, end - span + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const setQS = (next) => {
    const p = new URLSearchParams(sp);
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") p.delete(k);
      else p.set(k, String(v));
    });
    router.push(`?${p.toString()}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for: <span className="text-sky-600">“{q || "-"}”</span>
      </h1>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : err ? (
        <div className="text-rose-600">{err}</div>
      ) : !q ? (
        <p className="text-slate-500">Ketik kata kunci di kolom pencarian.</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">Tidak ada artikel ditemukan.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setQS({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              {pages.map((n) => (
                <button
                  key={n}
                  onClick={() => setQS({ page: n })}
                  className={`h-9 w-9 rounded-md grid place-content-center text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                    n === page ? "text-white bg-sky-600 border-sky-600" : ""
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setQS({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
