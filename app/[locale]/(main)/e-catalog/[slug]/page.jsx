"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import "quill/dist/quill.snow.css";
import "../../keberlanjutan/[slug]/QuillViewer.css";

const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";

/* helpers */
const imgUrl = (image, imageUrlFromBE, folder = "catalogs") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const money = (amount, currency = "IDR") => {
  const n = Number(amount || 0);
  const noFraction = ["IDR", "JPY", "KRW"].includes(
    String(currency || "").toUpperCase()
  );
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: noFraction ? 0 : 2,
    maximumFractionDigits: noFraction ? 0 : 2,
  }).format(n);
};

export default function CatalogDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // state untuk preview gambar
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get(`/upload/catalogs/${slug}`);
        setData(data?.data || null);
      } catch (e) {
        setErr(e?.response?.data?.message || "Data tidak ditemukan");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const cover = useMemo(
    () => imgUrl(data?.image, data?.imageUrl) || PLACEHOLDER,
    [data]
  );

  // kunci scroll + ESC untuk modal preview
  useEffect(() => {
    if (!previewOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && setPreviewOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.documentElement.style.overflow = prev || "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [previewOpen]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-72 rounded-xl bg-slate-100 animate-pulse lg:col-span-4" />
          <div className="space-y-4 lg:col-span-5">
            <div className="h-7 w-2/3 rounded bg-slate-200 animate-pulse" />
            <div className="h-24 rounded bg-slate-100 animate-pulse" />
            <div className="h-40 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-56 rounded-xl bg-slate-100 animate-pulse lg:col-span-3" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {err || "Tidak ditemukan."}
        </p>
      </main>
    );
  }

  const po = Number(data.price_original || 0);
  const pd = Number(data.price_discount || 0);
  const showDisc = pd > 0 && pd < po;
  const finalPrice = showDisc ? pd : po;
  const waLink = data.waLink || "#";

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-2 py-8 md:py-16">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: cover image */}
        <div className="lg:col-span-4">
          <div className="aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200 bg-white">
            <img
              src={cover}
              alt={data.title}
              className={`${
                cover === PLACEHOLDER ? "object-contain" : "object-cover"
              } h-full w-full cursor-zoom-in`}
              onClick={() => setPreviewOpen(true)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
                e.currentTarget.classList.remove("object-cover");
                e.currentTarget.classList.add("object-contain");
              }}
            />
          </div>
        </div>

        {/* Middle: title + full content */}
        <div className="lg:col-span-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {data.title}
          </h1>

          <div className="mt-6 quill-viewer ql-snow">
            <div
              className="ql-editor max-w-none text-lg"
              dangerouslySetInnerHTML={{ __html: data.content || "" }}
            />
          </div>
        </div>

        {/* Right: price card */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-slate-900 font-semibold mb-2">Harga</div>

            {showDisc && (
              <div className="text-rose-400 line-through text-sm">
                {money(po, data.currency || "IDR")}
              </div>
            )}
            <div className="text-2xl font-extrabold text-slate-900">
              {money(finalPrice, data.currency || "IDR")}
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-semibold text-white hover:opacity-95 transition bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468]"
            >
              Beli Sekarang
            </a>
          </div>
        </aside>
      </div>

      {/* ===== Preview Modal / Zoom ===== */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={cover}
              alt={data.title}
              className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between text-slate-200">
              <div className="text-sm line-clamp-1">{data.title}</div>
              <div className="flex items-center gap-2">
                <a
                  href={cover}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20"
                  aria-label="Close preview"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
