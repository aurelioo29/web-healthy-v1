"use client";

import React from "react";
import Image from "next/image";

export default function FounderProfileBlock({
  position = "right", // 'left' | 'right'
  title,
  bodyHtml,
  imageUrl = "/images/catalog-pages/placeholder.png",
  imageAlt = "",
}) {
  const imageRight = String(position) === "right";

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-5">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* Kolom Gambar */}
        <div
          className={`relative overflow-hidden rounded-3xl md:rounded-2xl ${
            imageRight ? "md:order-2" : "md:order-1"
          } order-1`}
        >
          <div className="relative w-full aspect-[4/5] md:aspect-[2/2]">
            <Image
              src={imageUrl}
              alt={imageAlt || title || "Profile"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="bg-white object-contain md:object-cover md:object-center"
              priority={false}
            />
          </div>
        </div>

        {/* Kolom Teks */}
        <div className={`${imageRight ? "md:order-1" : "md:order-2"} order-2`}>
          {title ? (
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          ) : null}

          {/* Body dari Quill (HTML) */}
          <div className="quill-viewer ql-snow">
            <div
              className="ql-editor prose prose-slate max-w-none mt-4 text-justify md:pt-0"
              // Pastikan bodyHtml sudah disanitasi saat save di BE
              dangerouslySetInnerHTML={{ __html: bodyHtml || "" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
