import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin, Phone } from "lucide-react";
import MapFrame from "@/components/MapFrame";

/* =========================
   Config
========================= */
const UI_CONFIG = {
  themeColor: "#4698E3",
  heroObjectFit: "contain",
  showHours: true,
  showServices: true,
  showContact: true,
  openImageInNewTab: true,
};

export const revalidate = 0;
export const dynamicParams = true;

/* =========================
   Helpers
========================= */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "/api";

function buildApiUrl(path, params = {}) {
  const base = API_BASE.replace(/\/$/, "");
  const qs = new URLSearchParams(params);
  return `${base}${path}${qs.toString() ? `?${qs}` : ""}`;
}

function ensureImageUrl(imageUrl, image) {
  const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
  if (imageUrl) return imageUrl;
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  if (!ASSET_BASE) return "";
  return `${ASSET_BASE.replace(/\/$/, "")}/${String(image).replace(
    /^\/+/,
    ""
  )}`;
}

function toWhatsAppInternational(input = "") {
  const digits = String(input).replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

function splitLines(s) {
  if (!s) return [];
  return String(s)
    .split(/\r?\n|;|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Ubah apa pun bentuk link_map jadi URL embed Google Maps yang valid. */
function toEmbedMapSrc(raw = "", fallbackQuery = "") {
  const v = String(raw || "").trim();
  if (!v && !fallbackQuery) return "";
  if (/google\.[^/]+\/maps\/embed/i.test(v)) return v; // <-- sudah embed
  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(v))
    // lat,lng
    return `https://www.google.com/maps?q=${encodeURIComponent(
      v
    )}&output=embed`;
  if (/maps\.app\.goo\.gl|goo\.gl\/maps|google\.[^/]+\/maps\//i.test(v))
    // share link
    return `https://www.google.com/maps?q=${encodeURIComponent(
      v
    )}&output=embed`;
  return `https://www.google.com/maps?q=${encodeURIComponent(
    v || fallbackQuery
  )}&output=embed`; // alamat teks
}

/* =========================
   Data loader per slug
========================= */
async function getBranchBySlug(slug) {
  const url = buildApiUrl(`/upload/lokasi-klinik/${encodeURIComponent(slug)}`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json();
  const d = json?.data ?? json;

  return {
    id: d.id,
    name: d.title || "-",
    slug: d.slug,
    imageUrl: ensureImageUrl(d.imageUrl, d.image),
    address: d.address || "",
    whatsapp: d.wa_number || d.phone || "",
    // simpan raw, nanti dinormalisasi di render
    mapRaw: d.link_map || "",
    hours: splitLines(d.operational),
    services: splitLines(d.type_service),
  };
}

/* =========================
   Page
========================= */
export default async function BranchDetailPage({ params }) {
  const { slug } = await params;
  const branch = await getBranchBySlug(slug);
  if (!branch) return notFound();

  const waIntl = toWhatsAppInternational(branch.whatsapp);
  const btnColor = UI_CONFIG.themeColor;
  const mapSrc = toEmbedMapSrc(branch.mapRaw, branch.address);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold">{branch.name}</h1>

      {/* Hero + Map */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Gambar – mobile di atas */}
        <div className="order-1 md:order-1 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="relative aspect-[16/9] md:aspect-auto md:h-[520px]">
            {UI_CONFIG.openImageInNewTab && branch.imageUrl ? (
              <a
                href={branch.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open image in new tab"
              >
                <Image
                  src={branch.imageUrl || "/images/lokasi-pages/undefined.png"}
                  alt={branch.name}
                  fill
                  className={`object-${UI_CONFIG.heroObjectFit}`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </a>
            ) : (
              <Image
                src={branch.imageUrl || "/images/lokasi-pages/undefined.png"}
                alt={branch.name}
                fill
                className={`object-${UI_CONFIG.heroObjectFit}`}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
          </div>
        </div>

        {/* Map – mobile di bawah */}
        <div className="order-2 md:order-2 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="relative aspect-[16/9] md:h-[520px]">
            {mapSrc ? (
              <MapFrame src={mapSrc} title={`Peta ${branch.name}`} />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-slate-100 text-slate-500">
                Link peta belum tersedia
              </div>
            )}
          </div>

          {branch.whatsapp && (
            <div className="p-4">
              <a
                href={`https://wa.me/${toWhatsAppInternational(
                  branch.whatsapp
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white transition"
                style={{ backgroundColor: UI_CONFIG.themeColor }}
              >
                <MessageCircle className="h-5 w-5" />
                Pesan Sekarang
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold">Informasi Umum</h2>

        {UI_CONFIG.showContact && (branch.address || branch.whatsapp) && (
          <>
            {branch.address && (
              <div className="mt-6 flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="text-slate-800 whitespace-pre-line">
                  {branch.address}
                </div>
              </div>
            )}

            {branch.whatsapp && (
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <Phone className="h-5 w-5" />
                </span>
                <div className="text-slate-800">{branch.whatsapp}</div>
              </div>
            )}
          </>
        )}

        {UI_CONFIG.showHours && branch.hours?.length > 0 && (
          <div className="mt-12">
            <div className="font-semibold">Jam Buka</div>
            <ul className="mt-2 space-y-1 text-slate-800">
              {branch.hours.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {UI_CONFIG.showServices && branch.services?.length > 0 && (
          <div className="mt-12">
            <div className="font-semibold">Jenis Layanan</div>
            <ul className="mt-2 space-y-1 text-slate-800">
              {branch.services.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
