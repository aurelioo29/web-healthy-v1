"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* --- loader agar URL remote bisa dipakai tanpa next.config --- */
const passThroughLoader = ({ src }) => src;

/* ====== DEMO ITEMS (boleh ganti ke /public/images/...) ====== */
const DEMO_ITEMS = [
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
    title: "Ruang Tunggu",
    alt: "Ruang tunggu",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    title: "Poli Umum",
    alt: "Poli umum",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
    title: "Apotek",
    alt: "Apotek",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    title: "Vaksinasi",
    alt: "Vaksinasi",
  },
];

/* ===== Preview Modal with animation ===== */
function PreviewModal({ open, item, onClose }) {
  const reduce = useReducedMotion();
  const [zoomed, setZoomed] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key.toLowerCase() === "z") setZoomed((z) => !z);
    };
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevHtml || "";
      document.body.style.overflow = prevBody || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            layoutId={`card-${item.id}`}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(95vw,1100px)]"
            initial={reduce ? {} : { scale: 0.96, opacity: 0 }}
            animate={reduce ? {} : { scale: 1, opacity: 1 }}
            exit={reduce ? {} : { scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/20 ring-1 ring-white/10">
              <motion.div
                className="absolute inset-0 cursor-zoom-in"
                animate={{ scale: zoomed ? 1.25 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                drag={zoomed}
                dragMomentum={false}
                dragConstraints={{
                  left: -120,
                  right: 120,
                  top: -80,
                  bottom: 80,
                }}
                onDoubleClick={() => setZoomed((z) => !z)}
                whileTap={{ cursor: zoomed ? "grabbing" : "zoom-out" }}
              >
                <Image
                  src={item.src}
                  alt={item.alt || item.title || "Preview"}
                  fill
                  loader={passThroughLoader}
                  unoptimized
                  className="object-contain"
                  priority
                  sizes="95vw"
                />
              </motion.div>
            </div>

            <div className="mt-3 flex items-center justify-between text-slate-200">
              <div className="text-sm line-clamp-1">
                {item.title || item.alt || "Preview"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomed((z) => !z)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                  title="Toggle Zoom (Z / Double Click)"
                >
                  {zoomed ? "Reset Zoom" : "Zoom"}
                </button>
                <a
                  href={item.src}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                >
                  Open in new tab
                </a>
                <button
                  onClick={onClose}
                  className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ===== Card Grid ===== */
export default function ImageCardGrid({ items = [] }) {
  const [preview, setPreview] = React.useState(null);

  // kalau tidak ada props, pakai DEMO_ITEMS
  const list = items?.length ? items : DEMO_ITEMS;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 max-w-7xl mx-auto px-6 md:px-0">
        {list.map((it, i) => (
          <motion.article
            key={it.id ?? i}
            layoutId={`card-${it.id ?? i}`}
            className="group relative rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
          >
            <button
              type="button"
              onClick={() => setPreview({ ...it, src: it.src })}
              className="block w-full text-left"
              title="Preview"
              aria-label={`Preview ${it.title || "image"}`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={it.src}
                  alt={it.alt || it.title || "Image"}
                  fill
                  loader={passThroughLoader}
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width:1024px) 100vw, 25vw"
                />
              </div>

              <div className="p-4">
                <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                  {it.title || "Untitled"}
                </h3>
              </div>
            </button>

            {/* subtle gradient glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-sky-200/10 to-transparent" />
            </div>
          </motion.article>
        ))}
      </div>

      <PreviewModal
        open={!!preview}
        item={preview}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
