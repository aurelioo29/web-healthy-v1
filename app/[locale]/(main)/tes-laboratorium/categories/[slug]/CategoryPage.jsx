"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import CategoryHero from "./CategoryHero";
import { ChevronRight } from "lucide-react";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const BRAND = "#4698E3";

const imgUrl = (image, imageUrlFromBE, folder = "category-lab-tests") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug;

  const pageParam = Number(searchParams.get("page") || 1);
  const qParam = searchParams.get("q") || "";

  const [cat, setCat] = useState(null);
  const [cats, setCats] = useState([]);
  const [list, setList] = useState({
    labTests: [],
    totalPages: 1,
    currentPage: 1,
    totalLabTests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // load all categories (sidebar)
  useEffect(() => {
    api
      .get("/upload/category-lab-tests", { params: { page: 1, size: 1000 } })
      .then((res) => setCats(res?.data?.data?.categories || []))
      .catch(() => setCats([]));
  }, []);

  // load category detail
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get(`/upload/category-lab-tests/${slug}`);
        const catData = data?.data || null;
        setCat(catData);

        // fetch list of lab tests in this category
        if (catData?.id) {
          const { data: d2 } = await api.get("/upload/lab-tests", {
            params: {
              page: pageParam,
              size: 24,
              search: qParam || undefined,
              category_id: catData.id,
            },
          });
          setList(
            d2?.data || {
              labTests: [],
              totalPages: 1,
              currentPage: 1,
              totalLabTests: 0,
            }
          );
        } else {
          setList({
            labTests: [],
            totalPages: 1,
            currentPage: 1,
            totalLabTests: 0,
          });
        }
      } catch (e) {
        setErr(e?.response?.data?.message || "Kategori tidak ditemukan");
        setCat(null);
        setList({
          labTests: [],
          totalPages: 1,
          currentPage: 1,
          totalLabTests: 0,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, pageParam, qParam]);

  const heroImg = imgUrl(cat?.image, cat?.imageUrl);

  const pages = useMemo(() => {
    const total = Math.max(1, Number(list.totalPages) || 1);
    const cur = Math.max(1, Number(list.currentPage) || 1);
    const span = 5,
      half = Math.floor(span / 2);
    let start = Math.max(1, cur - half);
    let end = Math.min(total, start + span - 1);
    if (end - start + 1 < span) start = Math.max(1, end - span + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [list.totalPages, list.currentPage]);

  const setQS = (next) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") p.delete(k);
      else p.set(k, String(v));
    });
    router.push(`?${p.toString()}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      <CategoryHero
        title={cat ? `Kategori ${cat.name}` : "Kategori"}
        description={cat?.description || ""}
        iconSrc={heroImg || undefined}
        bgSrc="/images/tes-lab-pages/Hero-Detail.webp"
        ctaHref="#selengkapnya"
        ctaText="Lihat Selengkapnya"
      />

      {/* ===== List by Category ===== */}
      <section id="selengkapnya" className="grid gap-8 md:grid-cols-12">
        {/* Sidebar kiri */}
        <aside className="md:col-span-4 lg:col-span-2 sticky top-24 h-max rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] text-white px-5 py-3 font-semibold">
            Kategori Tes
          </div>

          {/* List kategori */}
          <ul className="divide-y divide-slate-100">
            {cats.map((c) => {
              const href = `/tes-laboratorium/categories/${c.slug}`;
              const active = c.slug === slug;
              return (
                <li key={c.id}>
                  <Link
                    href={href}
                    className={`flex items-start gap-3 px-5 py-3 text-base transition w-full ${
                      active
                        ? "bg-[#4698E3]/10 text-[#4698E3] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <ChevronRight
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        active ? "text-[#4698E3]" : "text-slate-400"
                      }`}
                    />
                    {/* biar teks bisa wrap ke bawah */}
                    <span className="flex-1 min-w-0 whitespace-normal break-words font-semibold">
                      {c.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Konten kanan: daftar judul (mis. “Phospholipids”) */}
        <div className="md:col-span-8 lg:col-span-10 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : list.labTests?.length ? (
              list.labTests.map((t) => (
                <Link
                  key={t.id}
                  href={`/tes-laboratorium/${t.slug}`}
                  className="block truncate hover:underline text-slate-800 text-lg"
                  title={t.title}
                >
                  {t.title}
                </Link>
              ))
            ) : (
              <div className="text-slate-500">{err || "Belum ada data."}</div>
            )}
          </div>

          {/* Paging */}
          {list.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setQS({ page: Math.max(1, pageParam - 1) })}
                disabled={pageParam <= 1}
                className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Prev
              </button>
              {pages.map((n) => (
                <button
                  key={n}
                  onClick={() => setQS({ page: n })}
                  className={`h-9 w-9 rounded-md grid place-content-center text-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                    n === (list.currentPage || 1)
                      ? "text-white"
                      : "text-slate-700"
                  }`}
                  style={
                    n === (list.currentPage || 1)
                      ? { background: BRAND, borderColor: BRAND }
                      : {}
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() =>
                  setQS({ page: Math.min(list.totalPages, pageParam + 1) })
                }
                disabled={pageParam >= list.totalPages}
                className="px-3 py-1 rounded-lg ring-1 ring-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
