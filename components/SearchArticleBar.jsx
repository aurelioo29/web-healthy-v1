"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import api from "@/lib/axios";

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";

const imgUrl = (image, imageUrlFromBE, folder = "articles") => {
  if (imageUrlFromBE) return imageUrlFromBE;
  if (!image) return PLACEHOLDER;
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return PLACEHOLDER;
  const rel = image.includes("/") ? image : `${folder}/${image}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

/**
 * SearchArticleBar
 * - autocomplete artikel
 * - submit pakai ENTER (form submit), TIDAK ada tombol "Search"
 *
 * Props:
 * - className?: string
 * - autoFocus?: boolean
 * - onAfterSubmit?: () => void
 */
export default function SearchArticleBar({
  className = "",
  autoFocus = false,
  onAfterSubmit,
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [open, setOpen] = useState(false);
  const [sugs, setSugs] = useState([]);

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2) {
      setSugs([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/upload/articles", {
          params: { search: q.trim(), status: "published", size: 5, page: 1 },
        });
        setSugs(data?.data?.articles || []);
        setOpen(true);
      } catch {
        setSugs([]);
      }
    }, 250);
  }, [q]);

  const goResult = (e) => {
    e?.preventDefault?.();
    const term = q.trim();
    if (!term) return;
    router.push(`/artikel-kesehatan/search?q=${encodeURIComponent(term)}`);
    setOpen(false);
    onAfterSubmit?.();
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      {/* ENTER akan submit form */}
      <form
        onSubmit={goResult}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-white/20 shadow-sm"
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          placeholder="search..."
          className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Clear"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </form>

      {open && sugs.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
          {sugs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onAfterSubmit?.();
                router.push(`/artikel-kesehatan/${s.slug}`);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
            >
              <img
                src={s.imageUrl || imgUrl(s.image)}
                alt={s.title}
                className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
              />
              <span className="line-clamp-1 text-sm text-black">{s.title}</span>
            </button>
          ))}
          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={goResult}
              className="w-full px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Lihat semua hasil untuk “{q}”
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
