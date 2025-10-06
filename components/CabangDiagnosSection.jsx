"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* ======================
   Konfigurasi API & Helper
====================== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

function buildApiUrl(path, params = {}) {
  const base = API_BASE.replace(/\/$/, "");
  const qs = new URLSearchParams(params);
  return `${base}${path}${qs.toString() ? `?${qs}` : ""}`;
}

function ensureImageUrl(imageUrl, image) {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return `${ASSET_BASE.replace(/\/$/, "")}/${String(image).replace(
    /^\/+/,
    ""
  )}`;
}

// fallback slug kalau (hampir pasti) sudah ada dari BE
const toSlug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ======================
   ENUM jenis (harus match BE)
====================== */
const JENIS = {
  LAB: "Laboratorium_Utama",
  CLINIC: "Klinik",
  NETWORK: "Mitra_Jaringan",
};

const TAB_LABEL = {
  [JENIS.LAB]: "Laboratorium Utama",
  [JENIS.CLINIC]: "Klinik",
  [JENIS.NETWORK]: "Mitra dan Jaringan",
};

const TABS = [JENIS.LAB, JENIS.CLINIC, JENIS.NETWORK];

/* ======================
   Komponen Utama
====================== */
export default function CabangDiagnosiSection() {
  const [active, setActive] = useState(JENIS.LAB);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        // Ambil banyak row supaya cukup untuk semua tab
        const url = buildApiUrl("/upload/lokasi-klinik", {
          page: 1,
          size: 500,
        });
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const payload = json?.data ?? json;

        const list =
          (Array.isArray(payload) && payload) ||
          payload?.lokasiKliniks || // ✅ nama yang benar dari BE
          payload?.lokasi_klinik || // fallback kalau kamu ubah di BE
          payload?.rows ||
          payload?.items ||
          payload?.data ||
          payload?.results ||
          [];

        const mapped = (list || []).map((x) => ({
          id: x.id,
          title: x.title || "",
          slug: x.slug || toSlug(x.title || ""),
          address: x.address || "",
          imageUrl: ensureImageUrl(x.imageUrl, x.image),
          jenis: x.jenis, // <- akan berisi "Klinik" / "Laboratorium_Utama" / "Mitra_Jaringan"
          date: String(x.created_at ?? x.createdAt ?? "").slice(0, 10),
        }));

        if (!alive) return;
        setRows(mapped);
      } catch (e) {
        if (!alive) return;
        setErr(
          e?.message || "Gagal memuat data lokasi klinik. Coba muat ulang."
        );
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const g = {
      [JENIS.LAB]: [],
      [JENIS.CLINIC]: [],
      [JENIS.NETWORK]: [],
    };
    rows.forEach((r) => {
      if (g[r.jenis]) g[r.jenis].push(r);
    });
    return g;
  }, [rows]);

  const items = grouped[active] || [];

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {TABS.map((key) => {
          const isActive = active === key;
          const count = (grouped[key] || []).length;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`rounded-full px-6 py-2 text-sm font-medium ring-1 transition
                ${
                  isActive
                    ? "bg-[#4698E3] text-white ring-transparent"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                }`}
              aria-pressed={isActive}
            >
              {TAB_LABEL[key]}
              {typeof count === "number" ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {/* State */}
      {loading ? (
        <div className="text-slate-500 text-center py-10">Loading…</div>
      ) : err ? (
        <div className="text-rose-600 text-center py-10">{err}</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 text-center py-10">
          Belum ada lokasi pada kategori ini.
        </div>
      ) : (
        <>
          {/* MOBILE: Swiper only */}
          <div className="md:hidden">
            <Swiper
              modules={[FreeMode, Pagination, A11y]}
              freeMode={{ enabled: true, momentumBounce: false }}
              slidesPerView="auto"
              spaceBetween={16}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="branch-swiper !pb-8"
              style={{
                "--swiper-pagination-bottom": "0px",
                "--swiper-pagination-bullet-size": "8px",
                "--swiper-pagination-bullet-horizontal-gap": "6px",
                "--swiper-pagination-color": "#4698E3",
                "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
                "--swiper-pagination-bullet-inactive-opacity": "1",
              }}
            >
              {items.map((b) => (
                <SwiperSlide
                  key={b.id}
                  className="!w-[85%] xs:!w-[320px] sm:!w-[360px]"
                >
                  <Card branch={b} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* DESKTOP/TABLET: grid */}
          <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((b) => (
              <Card key={b.id} branch={b} />
            ))}
          </div>
        </>
      )}

      {/* bullet styling jaga-jaga */}
      <style jsx global>{`
        .branch-swiper .swiper-pagination-bullet {
          background: var(--swiper-pagination-bullet-inactive-color) !important;
          opacity: var(--swiper-pagination-bullet-inactive-opacity) !important;
        }
        .branch-swiper .swiper-pagination-bullet-active {
          background: var(--swiper-pagination-color) !important;
        }
      `}</style>
    </section>
  );
}

/* ======================
   Kartu Lokasi
====================== */
function Card({ branch }) {
  const href = `/cabang-diagnos/${branch.slug || toSlug(branch.title)}`;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Poster */}
      {branch.imageUrl ? (
        <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
          <Image
            src={branch.imageUrl}
            alt={branch.title || "Lokasi klinik"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      ) : null}

      {/* Judul & alamat */}
      <h3 className="text-lg font-semibold leading-snug">{branch.title}</h3>
      {branch.address ? (
        <p className="mt-3 flex-1 text-sm text-slate-700 line-clamp-4">
          {branch.address}
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm text-slate-500 italic">
          Alamat belum diisi
        </p>
      )}

      {/* CTA */}
      <Link
        href={href}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#4698E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b86cf] transition"
      >
        Selengkapnya
      </Link>
    </article>
  );
}
