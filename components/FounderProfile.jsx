"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import api from "@/lib/axios";
import FounderProfileBlock from "./FounderProfileBlock";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const LIST_PATH = "/upload/about-us-president";

const ensureImageUrl = (imageUrl, image, folder = "services") => {
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

// true kalau aktif (1/"1"/true/"true")
const isActive = (v) =>
  v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";

// ambil i18n sesuai locale (fallback ke id atau entry pertama)
const pickI18n = (entry, locale) => {
  if (Array.isArray(entry?.i18n)) {
    return (
      entry.i18n.find((x) => x?.locale === locale) ||
      entry.i18n.find((x) => x?.locale === "id") ||
      entry.i18n[0] ||
      {}
    );
  }
  // bentuk object { id: {...}, en: {...} }
  if (entry?.i18n && typeof entry.i18n === "object") {
    return entry.i18n[locale] || entry.i18n.id || {};
  }
  // fallback ke field datar
  return {
    title: entry?.title || "",
    body_html: entry?.body_html || "",
  };
};

export default function FounderProfile() {
  const locale = useLocale();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(LIST_PATH, { params: { locale } });
        const payload = res?.data?.data ?? res?.data ?? {};
        const list =
          (Array.isArray(payload) && payload) ||
          payload.services ||
          payload.sections ||
          payload.items ||
          payload.rows ||
          [];

        const mapped = list
          .filter((it) => isActive(it.is_active ?? it.isActive))
          .map((it) => {
            const tr = pickI18n(it, locale);
            return {
              id: it.id,
              position: it.position || "right", // default kanan biar terlihat variasinya
              title: tr?.title || it.title || "",
              body_html: tr?.body_html || it.body_html || "",
              imageUrl: ensureImageUrl(it.imageUrl, it.image),
            };
          });

        if (alive) setServices(mapped);
      } catch {
        if (alive) setServices([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [locale]);

  if (loading && services.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 text-slate-500">
        Loading…
      </div>
    );
  }

  if (!services.length) return null;

  return (
    <>
      {services.map((s) => (
        <FounderProfileBlock
          key={s.id}
          position={s.position}
          title={s.title}
          bodyHtml={s.body_html}
          imageUrl={s.imageUrl}
          imageAlt={s.title}
        />
      ))}
    </>
  );
}
