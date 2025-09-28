"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/axios";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";

const imgUrl = (image, imageUrlFromBE) => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  const rel = image.includes("/") ? image : `category-lab-tests/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

export default function TesLaboratoriumCard() {
  const t = useTranslations("tesLaboratoriumCard");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/upload/category-lab-tests", {
          params: { page: 1, size: 1000 },
        });
        setRows(data?.data?.categories || []);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
      <p className="mt-2 text-slate-600">{t("desc")}</p>

      {err ? (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
          {err}
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        {loading && !rows.length
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] rounded-2xl ring-1 ring-slate-200 bg-white animate-pulse"
              />
            ))
          : rows.map((c) => {
              const src = imgUrl(c.image, c.imageUrl);
              return (
                <Link
                  key={c.id}
                  href={`/tes-laboratorium/categories/${c.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm"
                >
                  <div className="relative mx-auto h-28 w-28">
                    {src ? (
                      <Image
                        src={src}
                        alt={c.name}
                        fill
                        sizes="112px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="h-full w-full rounded bg-slate-100 grid place-content-center text-xs text-slate-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center font-semibold group-hover:underline">
                    {c.name}
                  </div>
                </Link>
              );
            })}
      </div>
    </main>
  );
}
