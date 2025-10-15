"use client";

import React from "react";
import api from "@/lib/axios";
import { useTranslations } from "next-intl";

/* ===== helpers ===== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const buildFileUrl = (file, fileUrlFromBE, folder = "investors") => {
  if (fileUrlFromBE) return fileUrlFromBE;
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  if (!ASSET_BASE) return "";
  const rel = file.includes("/") ? file : `${folder}/${file}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};
const stripHtml = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const truncate = (s = "", n = 140) =>
  s.length > n ? s.slice(0, n - 1).trim() + "…" : s;

function SidebarItem({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-4 py-2.5 transition ring-1 ${
        active
          ? "bg-[#2E6F63]/10 text-[#2E6F63] ring-[#2E6F63]/20 font-semibold"
          : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-5 animate-pulse">
      <div className="h-36 rounded-xl bg-slate-100" />
      <div className="mt-4 h-4 w-2/3 bg-slate-100 rounded" />
      <div className="mt-4 h-10 bg-slate-100 rounded-lg" />
    </div>
  );
}

/* ===== main ===== */
export default function InvestorCard() {
  const t = useTranslations("investor");
  const [cats, setCats] = React.useState([]);
  const [activeCat, setActiveCat] = React.useState(null);

  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [size] = React.useState(12);
  const [totalPages, setTotalPages] = React.useState(1);

  const [loadingCats, setLoadingCats] = React.useState(true);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [err, setErr] = React.useState("");

  // load kategori
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await api.get("/upload/category-investors", {
          params: { page: 1, size: 500 },
          headers: { "Cache-Control": "no-cache" },
        });
        const box = res?.data?.data || {};
        const list =
          box.categories ||
          box.category_investors ||
          box.items ||
          box.rows ||
          [];
        setCats(list);
        if (!activeCat && list.length) setActiveCat(list[0].id);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Gagal memuat kategori"
        );
        setCats([]);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // load dokumen by kategori
  const fetchDocs = React.useCallback(
    async (targetPage = 1, append = false) => {
      if (!activeCat) return;
      try {
        setErr("");
        append ? setLoadingMore(true) : setLoadingList(true);
        const res = await api.get("/upload/investors", {
          params: {
            page: targetPage,
            size,
            status: "published",
            category_id: activeCat,
          },
          headers: { "Cache-Control": "no-cache" },
        });
        const box = res?.data?.data || {};
        const list = box.investors || box.items || box.rows || [];
        const mapped = list.map((r) => ({
          id: r.id,
          title: r.title,
          date: r.date,
          content: r.content,
          slug: r.slug,
          fileUrl: buildFileUrl(r.file, r.fileUrl),
        }));
        setItems((prev) => (append ? [...prev, ...mapped] : mapped));
        setPage(targetPage);
        setTotalPages(box.totalPages || 1);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Gagal memuat dokumen"
        );
        setItems([]);
        setPage(1);
        setTotalPages(1);
      } finally {
        append ? setLoadingMore(false) : setLoadingList(false);
      }
    },
    [activeCat, size]
  );

  React.useEffect(() => {
    if (activeCat) fetchDocs(1, false);
  }, [activeCat, fetchDocs]);

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center">
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">
            {t("title")}
          </h1>
        </div>

        {/* ✅ pakai grid standar supaya sidebar BENAR-BENAR di kiri */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar kiri */}
          <aside className="md:col-span-3">
            <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-3 md:p-4 h-max md:sticky md:top-6">
              {loadingCats ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : cats.length === 0 ? (
                <div className="text-sm text-slate-600">
                  Kategori belum tersedia.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {cats.map((c) => (
                    <SidebarItem
                      key={c.id}
                      active={String(activeCat) === String(c.id)}
                      onClick={() => {
                        setActiveCat(c.id);
                        setPage(1); // reset paging saat pindah kategori
                        window?.scrollTo?.({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {c.name}
                    </SidebarItem>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Konten kanan */}
          <main className="md:col-span-9">
            {/* {err ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            ) : null} */}

            {loadingList ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6 text-center text-slate-600">
                Dokumen belum ada pada kategori ini.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((it) => (
                    <article
                      key={it.id}
                      className="flex h-full flex-col rounded-2xl ring-1 ring-slate-200 bg-white p-5"
                    >
                      {/* Preview: samakan tinggi */}
                      <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-8 grid place-items-center h-40">
                        <span className="text-6xl" aria-hidden>
                          📈
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-semibold line-clamp-2 text-center">
                        {it.title}
                      </h3>

                      {it.date ? (
                        <div className="mt-1 text-sm text-center text-slate-500">
                          {new Date(it.date).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      ) : null}

                      {/* Deskripsi boleh panjang, tapi biar tombol tetap nempel bawah */}
                      <p className="mt-6 line-clamp-3 text-sm text-slate-600 text-center">
                        {truncate(stripHtml(it.content || ""), 210)}
                      </p>

                      {/* Tombol SELALU di bawah */}
                      <div className="mt-auto pt-6">
                        {it.fileUrl ? (
                          <a
                            href={it.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#2E6F63] px-4 py-2.5 text-white font-medium hover:bg-[#24584F] transition"
                          >
                            Download File
                          </a>
                        ) : (
                          <span className="inline-flex w-full items-center justify-center rounded-xl ring-1 ring-slate-200 px-4 py-2.5 text-slate-500">
                            File tidak tersedia
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {page < totalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      disabled={loadingMore}
                      onClick={() => fetchDocs(page + 1, true)}
                      className="rounded-lg ring-1 ring-slate-200 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
