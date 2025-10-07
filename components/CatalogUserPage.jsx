"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

const BRAND = "#4698E3";
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
const PLACEHOLDER = "/images/catalog-pages/placeholder.png";

/* ---- utils ---- */
const imgUrl = (image, imageUrlFromBE, folder = "catalogs") => {
  const src = imageUrlFromBE || image;
  if (!src) return PLACEHOLDER; // <= kosong -> placeholder
  if (/^https?:\/\//i.test(src)) return src; // absolute url
  if (!ASSET_BASE) return PLACEHOLDER; // asset base kosong -> placeholder
  const rel = src.includes("/") ? src : `${folder}/${src}`;
  return `${ASSET_BASE.replace(/\/$/, "")}/${rel.replace(/^\/+/, "")}`;
};

const money = (amount, currency = "IDR") => {
  const n = Number(amount || 0);
  const zeroFraction = ["IDR", "JPY", "KRW"].includes(
    (currency || "").toUpperCase()
  );
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: zeroFraction ? 0 : 2,
    maximumFractionDigits: zeroFraction ? 0 : 2,
  }).format(n);
};

/* ---- sub components ---- */
function Price({ original, discount, currency = "IDR" }) {
  const po = Number(original || 0);
  const pd = Number(discount || 0);
  return pd > 0 && pd < po ? (
    <div className="flex flex-col">
      <span className="text-rose-500 line-through">{money(po, currency)}</span>
      <span className="font-semibold text-slate-900">
        {money(pd, currency)}
      </span>
    </div>
  ) : (
    <span className="font-semibold text-slate-900">{money(po, currency)}</span>
  );
}

function CatalogCard({ item }) {
  const cover = imgUrl(item.image, item.imageUrl);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      {/* Gambar seragam */}
      <div className="h-56 md:h-60 bg-slate-50 overflow-hidden">
        <img
          src={cover || PLACEHOLDER}
          alt={item.title}
          loading="lazy"
          className={`${
            cover ? "object-cover" : "object-contain"
          } h-full w-full`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
            e.currentTarget.classList.remove("object-cover");
            e.currentTarget.classList.add("object-contain");
          }}
        />
      </div>

      {/* Body: susunan konsisten */}
      <div className="flex-1 p-4 flex flex-col">
        {/* category */}
        <div className="text-sm text-slate-500">
          {item?.category?.name || "—"}
        </div>

        {/* title: clamp 2 baris + min height agar rata */}
        <h3 className="mt-1 text-base font-semibold text-slate-900 leading-6 line-clamp-2 min-h-[3rem]">
          {item.title}
        </h3>

        <div
          className="mt-2 text-sm text-slate-600 leading-5 line-clamp-3 min-h-[3.75rem]"
          dangerouslySetInnerHTML={{ __html: item.content || "" }}
        />

        <div className="mt-3 mb-3">
          <Price
            original={item.price_original}
            discount={item.price_discount}
            currency={item.currency || "IDR"}
          />
        </div>

        <Link
          href={`/e-catalog/${item.slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white hover:opacity-95 transition bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, onPickSuggestion }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const ref = useRef(null);
  const t = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    if (!value || value.trim().length < 2) {
      setList([]);
      return;
    }
    t.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/upload/catalogs", {
          params: { search: value, status: "published", size: 5, page: 1 },
        });
        setList(data?.data?.catalogs || []);
        setOpen(true);
      } catch {
        setList([]);
      }
    }, 250);
  }, [value]);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 px-3 py-2">
        <span className="text-slate-400">🔎</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value && setOpen(true)}
          placeholder="Cari katalog…"
          className="flex-1 outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Clear"
          >
            ✕
          </button>
        ) : null}
      </div>

      {open && list.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 z-20 overflow-hidden">
          {list.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onPickSuggestion?.(s);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
            >
              {s.imageUrl || s.image ? (
                <img
                  src={s.imageUrl || imgUrl(s.image)}
                  alt={s.title}
                  className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-slate-100 grid place-content-center text-xs text-slate-500 ring-1 ring-slate-200">
                  No
                </div>
              )}
              <span className="line-clamp-1 text-sm">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- PAGE ---- */
export default function CatalogUserPage() {
  /** SIDEBAR: categories + multi-select */
  const [cats, setCats] = useState([]);
  const [selected, setSelected] = useState(() => new Set()); // << checkbox state

  /** LIST */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /** FILTERS */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const size = 24;

  // load categories
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/upload/category-catalogs", {
          params: { page: 1, size: 1000 },
        });
        setCats(data?.data?.categories || []);
      } catch {
        setCats([]);
      }
    })();
  }, []);

  // fetch list when search / selected / page changes (dgn debounce utk search)
  const deb = useRef(null);
  useEffect(() => {
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => fetchList(1), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.from(selected).join(","), page]);

  const fetchList = async (pageArg = 1) => {
    setLoading(true);
    setErr("");

    const selectedIds = Array.from(selected);
    try {
      const params = {
        page: pageArg,
        size,
        status: "published",
        ...(search ? { search } : {}),
        // kalau BE nanti support multi-filter, kirim "category_ids"
        ...(selectedIds.length ? { category_ids: selectedIds.join(",") } : {}),
      };
      const { data } = await api.get("/upload/catalogs", { params });

      // map image url
      let list = (data?.data?.catalogs || []).map((c) => ({
        ...c,
        imageUrl: c.imageUrl || imgUrl(c.image),
      }));

      // Fallback filter di FE kalau BE belum support multi category:
      if (selectedIds.length) {
        const chosen = new Set(selectedIds.map((x) => Number(x)));
        list = list.filter((x) => chosen.has(Number(x.category_id)));
      }

      setRows(list);
      setPage(pageArg);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCat = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    setPage(1);
  };

  const clearCats = () => {
    setSelected(new Set());
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-10">
      <div className="grid gap-6 md:grid-cols-12">
        {/* ===== SIDEBAR KATEGORI ===== */}
        <aside className="md:col-span-3 lg:col-span-2 h-max sticky top-24 rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 font-semibold text-white bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468]">
            CATEGORIES
          </div>
          <div className="p-3 space-y-2">
            {cats.map((c) => {
              const checked = selected.has(String(c.id));
              return (
                <label
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => toggleCat(String(c.id))}
                  />
                  <span className="text-sm text-slate-700">{c.name}</span>
                </label>
              );
            })}
            <button
              onClick={clearCats}
              className="mt-2 w-full rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </aside>

        {/* ===== KONTEN KANAN ===== */}
        <section className="md:col-span-9 lg:col-span-10">
          {/* Search di atas kartu, tanpa Apply/Clear (pakai tombol X di input) */}
          <div className="mb-4">
            <SearchBox
              value={search}
              onChange={setSearch}
              onPickSuggestion={(item) =>
                (window.location.href = `/catalogs/${item.slug}`)
              }
            />
          </div>

          {/* Grid kartu */}
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading…</div>
          ) : err ? (
            <div className="py-16 text-center text-rose-600">{err}</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              Tidak ada katalog.
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {rows.map((r) => (
                <CatalogCard key={r.id} item={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
