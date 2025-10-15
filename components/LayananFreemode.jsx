"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import "swiper/css";
import api from "@/lib/axios";

/* ===== constants & helpers ===== */
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";
const DETAIL_PREFIX = "/e-catalog"; // ⬅️ ganti ke "/catalogs" kalau rute detail kamu itu

const imgUrl = (image, imageUrlFromBE, folder = "catalogs") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return PLACEHOLDER;
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const makeExcerpt = (html = "", n = 140) => {
  const s = stripHtml(html);
  return s.length > n ? `${s.slice(0, n)}…` : s;
};

// IDR tanpa ,00
const money = (amount, currency = "IDR") => {
  const noFraction = ["IDR", "JPY", "KRW"].includes(
    String(currency || "").toUpperCase()
  );
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: noFraction ? 0 : 2,
    maximumFractionDigits: noFraction ? 0 : 2,
  }).format(Number(amount || 0));
};

/* ===================================================== */

export default function LayananFreemode() {
  const t = useTranslations("layanan");

  // fallback konten (kalau API kosong/error)
  const keys = ["card1", "card2", "card3", "card4", "card5"];
  const safeT = (k) => {
    try {
      return t(k);
    } catch {
      return undefined;
    }
  };
  const fallbackCards = keys.map((k) => {
    const base = `card.${k}`;
    const desc = safeT(`${base}.desc`) ?? safeT(`${base}.description`) ?? "";
    return {
      id: `fallback-${k}`,
      title: safeT(`${base}.title`) ?? "",
      desc,
      img: safeT(`${base}.img`) ?? "",
      alt: safeT(`${base}.altImg`) ?? "",
      href: safeT(`${base}.href`) ?? "#",
      price: safeT(`${base}.price`) ?? "",
      disc: safeT(`${base}.disc`) ?? "",
      isFallback: true,
    };
  });

  // state dari API E-Catalog
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/upload/catalogs", {
          params: { status: "published", size: 20, page: 1 },
        });
        if (!alive) return;
        const list = data?.data?.catalogs || data?.data || [];
        const mapped = list.map((it) => {
          const po = Number(it.price_original || 0);
          const pd = Number(it.price_discount || 0);
          const showDisc = pd > 0 && pd < po;
          return {
            id: it.id,
            title: it.title,
            desc: makeExcerpt(it.content || it.excerpt || "", 120),
            img: imgUrl(it.image, it.imageUrl),
            alt: it.title,
            href: `${DETAIL_PREFIX}/${it.slug}`,
            price: money(showDisc ? pd : po, it.currency || "IDR"),
            disc: showDisc ? money(po, it.currency || "IDR") : "",
            isFallback: false,
          };
        });
        setRows(mapped);
      } catch {
        setRows([]); // biar pakai fallback
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // pilih data tampil: API > fallback
  const cards = useMemo(
    () => (rows && rows.length ? rows : fallbackCards),
    [rows, fallbackCards]
  );

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{t("title")}</h2>
        <p className="mt-4 text-[#667289]">{t("description")}</p>
      </div>

      {/* skeleton garis kecil biar ada feedback saat loading */}
      {loading && (
        <div className="mt-6 h-1 w-24 mx-auto rounded bg-slate-200 animate-pulse" />
      )}

      <div className="mt-8">
        <Swiper
          modules={[FreeMode, A11y]}
          a11y={{ enabled: true }}
          freeMode={{ enabled: true, momentumBounce: false }}
          grabCursor
          slidesPerView="auto"
          spaceBetween={16}
          className="!pb-2"
        >
          {cards.map((c) => (
            <SwiperSlide
              key={c.id}
              className="!w-[280px] sm:!w-[300px] md:!w-[340px] lg:!w-[360px]"
            >
              <Card {...c} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

/* ===== Card ===== */
function Card({ title, desc, img, alt, href, price, disc, isFallback }) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg flex flex-col">
      {/* Gambar */}
      <div className="relative aspect-square w-full">
        <Image
          src={img || PLACEHOLDER}
          alt={alt || title}
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </div>

      {/* Body */}
      <div className="flex grow flex-col p-4">
        <h3 className="text-base md:text-lg font-semibold text-center leading-6 line-clamp-2 min-h-[48px]">
          {title}
        </h3>

        <p className="my-2 text-sm text-[#667289] text-justify leading-6 line-clamp-3 min-h-[72px]">
          {desc}
        </p>

        {/* PRICE AREA: rata kiri, tanpa placeholder hantu */}
        <div className="my-5 flex w-full items-baseline justify-start gap-2 min-h-[24px]">
          {disc && (
            <span className="text-sm text-red-500 line-through shrink-0">
              {disc}
            </span>
          )}
          {price && (
            <span className="font-semibold text-slate-900">{price}</span>
          )}
        </div>

        <Link
          href={href}
          className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
        >
          {isFallback ? "Lihat Produk" : "View Details"}
        </Link>
      </div>
    </article>
  );
}
