"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { useLocale } from "next-intl";

const isInternalPath = (s = "") =>
  /^\/[A-Za-z0-9\-._~%!$&'()*+,;=:@/]*$/.test(String(s).trim());
const passThroughLoader = ({ src }) => src;

export default function HeroSectionClient({ pageKey, locale: localeProp }) {
  const currentLocale = (typeof useLocale === "function" && useLocale()) || "id";
  const locale = localeProp || currentLocale;

  const [row, setRow] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/upload/hero-sections", {
          params: { page: 1, size: 1, page_key: pageKey, locale },
          headers: { "Cache-Control": "no-cache" },
        });

        const payload = data?.data ?? data;
        const list =
          (Array.isArray(payload) && payload) ||
          payload.sections ||
          payload.heroSections ||
          payload.items ||
          payload.rows ||
          payload.data ||
          [];
        const first = list[0];
        if (!mounted) return;

        if (!first) {
          setRow(null);
          setLoading(false);
          return;
        }

        const tr = Array.isArray(first.i18n) ? first.i18n : [];
        const pick = (want) =>
          tr.find((x) => String(x.locale).toLowerCase() === want);
        const i18 =
          pick(String(locale).toLowerCase()) || pick("id") || pick("en") || {};

        setRow({
          page_key: first.page_key,
          // support 'left' | 'right' | 'full'
          position: String(first.position || "left").toLowerCase(),
          is_active: !!first.is_active,
          imageUrl: first.imageUrl || first.image_url || first.image || "",
          image_alt:
            first.image_alt || i18.title || first.page_key || "Hero image",
          title: i18.title || "",
          body_html: i18.body_html || "",
          cta_text: i18.cta_text || "",
          cta_link: i18.cta_link || "",
        });
      } catch (e) {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message || e.message || "Failed to load hero"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pageKey, locale]);

  if (loading) return null;
  if (err || !row || !row.is_active) return null;

  const isFull = row.position === "full";

  const imgOrderLg = row.position === "right" ? "lg:order-2" : "lg:order-1";
  const textOrderLg = row.position === "right" ? "lg:order-1" : "lg:order-2";

  const showCTA = Boolean(row.cta_text?.trim() && row.cta_link?.trim());
  const CTA = showCTA ? (
    isInternalPath(row.cta_link) ? (
      <Link
        href={row.cta_link}
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white font-medium hover:opacity-90 transition"
      >
        {row.cta_text}
      </Link>
    ) : (
      <a
        href={row.cta_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white font-medium hover:opacity-90 transition"
      >
        {row.cta_text}
      </a>
    )
  ) : null;

  return (
    <>
      {isFull ? (
        /* ===== FULL (tanpa BG, full-bleed) ===== */
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
          <div className="relative h-[42vh] md:h-[56vh] lg:h-[64vh] rounded-3xl overflow-hidden">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={row.image_alt}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                loader={passThroughLoader}
                unoptimized
              />
            ) : null}
          </div>
        </section>
      ) : (
        /* ===== SPLIT (2 kolom) seperti sebelumnya ===== */
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
          <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
            <div className="relative w-full bg-[#E9F3FF]">
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[520px] items-stretch">
                {/* IMAGE */}
                <div className={`order-1 ${imgOrderLg} h-full`}>
                  <div className="relative h-[420px] lg:h-full w-full p-4 sm:p-6 lg:p-10">
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt={row.image_alt}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover lg:object-contain object-center"
                        loader={passThroughLoader}
                        unoptimized
                      />
                    ) : null}
                  </div>
                </div>

                {/* TEXT */}
                <div className={`order-2 ${textOrderLg} h-full`}>
                  <div className="h-full flex items-center">
                    <div className="px-6 py-8 md:px-10 lg:px-12 max-w-xl">
                      {row.title ? (
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                          {row.title}
                        </h2>
                      ) : null}

                      {row.body_html ? (
                        <div
                          className="mt-4 leading-relaxed text-slate-800 prose prose-slate max-w-none"
                          dangerouslySetInnerHTML={{ __html: row.body_html }}
                        />
                      ) : null}

                      {showCTA ? (
                        <div className="mt-6 flex flex-wrap gap-3">{CTA}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
