"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutBlock({
  position = "right", // 'left' | 'right'
  title,
  bodyHtml,
  imageUrl,
  ctaHref,
  ctaText,
  imageAlt = "",
}) {
  const imageRight = String(position) === "right";

  // urutan grid responsif (mobile: image dulu, desktop sesuai position)
  const ImgCol = (
    <div
      className={`relative ${imageRight ? "md:order-2" : "md:order-1"} order-1`}
    >
      <div
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468]/15 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5">
        <Image
          src={imageUrl || "/images/catalog-pages/placeholder.png"}
          alt={imageAlt || title || "About"}
          width={1280}
          height={860}
          className="h-auto w-full object-cover"
          priority
        />
      </div>
    </div>
  );

  const TextCol = (
    <div
      className={`relative my-auto ${
        imageRight ? "md:order-1" : "md:order-2"
      } order-2`}
    >
      {/* DESKTOP: pill judul mengambang */}
      {title ? (
        <div className="pointer-events-none absolute -top-7 right-8 z-10 hidden md:block">
          <span className="inline-block rounded-lg bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2 text-2xl font-semibold text-white shadow-lg">
            {title}
          </span>
        </div>
      ) : null}

      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 md:p-8">
        {/* MOBILE: judul di bar */}
        {title ? (
          <div className="md:hidden -mt-2 mb-4">
            <div className="w-full rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] py-3 text-center font-semibold text-white shadow-lg">
              {title}
            </div>
          </div>
        ) : null}

        {/* Body dari Quill (HTML) */}
        <div className="quill-viewer ql-snow">
          <div
            className="ql-editor prose prose-slate max-w-none text-justify md:pt-8"
            dangerouslySetInnerHTML={{ __html: bodyHtml || "" }}
          />
        </div>

        {/* CTA dari next-intl (pakai props) */}
        {ctaHref && ctaText ? (
          <div className="mt-10">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white transition"
            >
              {ctaText}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-6 px-4 md:grid-cols-2 md:gap-8 md:px-6">
        {/* susun kolom sesuai posisi */}
        {imageRight ? (
          <>
            {TextCol}
            {ImgCol}
          </>
        ) : (
          <>
            {ImgCol}
            {TextCol}
          </>
        )}
      </div>
    </section>
  );
}
