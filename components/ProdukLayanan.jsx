"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion, useReducedMotion } from "framer-motion";
import api from "@/lib/axios";

/* helpers */
const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());
const isInternalPath = (s = "") =>
  /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/.test(String(s).trim());
const passThroughLoader = ({ src }) => src;
const toTime = (d) => (d ? new Date(d).getTime() : 0);

export default function ProdukLayananDynamic() {
  const t = useTranslations("produkLayanan");
  const reduce = useReducedMotion();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // Minta 10 data paling awal (oldest). BE bisa abaikan param; FE tetap sort fallback.
        const { data } = await api.get("/upload/produk-layanan", {
          params: {
            page: 1,
            size: 10,
            sort: "created_at", // gaya 1
            order: "asc", // gaya 1
            order_by: "created_at", // gaya 2
            direction: "asc", // gaya 2
          },
          headers: { "Cache-Control": "no-cache" },
        });

        const payload = data?.data ?? data?.result ?? data;
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (payload && typeof payload === "object") {
          list =
            payload.produkLayanans ||
            payload.items ||
            payload.rows ||
            payload.data ||
            [];
        }

        const normalized = (list || []).map((r) => ({
          id: r.id,
          title: r.title,
          desc: r.content,
          img: r.imageUrl || r.image || r.image_url || "",
          href: r.target_link || "#",
          createdAt: r.created_at || r.createdAt || null,
          updatedAt: r.updated_at || r.updatedAt || null,
        }));

        // FE fallback: urutkan paling awal (createdAt ASC), ambil 10
        const earliest10 = normalized
          .sort(
            (a, b) =>
              toTime(a.createdAt) - toTime(b.createdAt) ||
              toTime(a.updatedAt) - toTime(b.updatedAt) ||
              (a.id ?? 0) - (b.id ?? 0)
          )
          .slice(0, 10);

        if (alive) setItems(earliest10);
      } catch (e) {
        if (alive)
          setErr(
            e?.response?.data?.message || e.message || "Gagal memuat data"
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      {/* Heading */}
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-2xl font-bold md:text-3xl">{t("title")}</h2>
        <p className="mt-6 md:text-md text-[#667289]">{t("description")}</p>
      </motion.div>

      {/* Error */}
      {err && <p className="mt-6 text-center text-sm text-rose-600">{err}</p>}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white"
            >
              <div className="aspect-video md:aspect-[2/2] w-full bg-slate-100 rounded-t-3xl" />
              <div className="p-4">
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
                <div className="mt-2 h-3 w-full bg-slate-100 rounded" />
                <div className="mt-2 h-3 w-5/6 bg-slate-100 rounded" />
                <div className="mt-4 h-9 w-1/2 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !items.length && !err && (
        <p className="mt-6 text-center text-slate-500">Belum ada data.</p>
      )}

      {/* Swiper (all breakpoints) */}
      {!loading && items.length > 0 && (
        <div className="mt-10">
          <Swiper
            modules={[Pagination, Navigation, A11y]}
            pagination={{ clickable: false }}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            a11y={{ enabled: true }}
            className="produk-swiper !pb-12"
            style={{
              "--swiper-pagination-bottom": "0px",
              "--swiper-pagination-bullet-size": "8px",
              "--swiper-pagination-bullet-horizontal-gap": "6px",
              "--swiper-pagination-color": "#4698E3",
              "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
              "--swiper-pagination-bullet-inactive-opacity": "1",
            }}
          >
            {items.map((c) => (
              <SwiperSlide key={c.id}>
                <Card {...c} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}

/* Card */
function Card({ title, desc, img, href }) {
  const CardInner = (
    <article className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-[1px] transition-shadow hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4698E3]/8 to-transparent" />
      </div>

      <div className="relative aspect-video md:aspect-[2/2] w-full">
        {img ? (
          <Image
            src={img}
            alt={title || "Produk Layanan"}
            fill
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loader={passThroughLoader}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-slate-100 text-slate-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 text-center mt-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {desc && (
          <p className="mt-1 text-sm leading-relaxed text-[#667289] line-clamp-3">
            {desc}
          </p>
        )}
        <div className="mt-5">
          <span className="inline-block rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-4 py-2 text-sm font-medium text-white">
            Lihat Selengkapnya
          </span>
        </div>
      </div>
    </article>
  );

  if (href && isInternalPath(href)) return <Link href={href}>{CardInner}</Link>;
  if (href && isHttpUrl(href))
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {CardInner}
      </a>
    );
  return CardInner;
}
