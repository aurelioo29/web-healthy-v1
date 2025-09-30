import { notFound } from "next/navigation";
import "quill/dist/quill.snow.css";
import "../../keberlanjutan/[slug]/QuillViewer.css";

const ZONE = "Asia/Jakarta";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL;
const ASSET_BASE =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const BRAND = "#4698E3";

/* ===== Fetch ===== */
async function getData(slug) {
  const res = await fetch(`${API_BASE}/upload/articles/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

/* ===== Meta ===== */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return { title: "Article Not Found" };

  const img =
    data.imageUrl ||
    (data.image
      ? `${ASSET_BASE.replace(/\/$/, "")}/${String(data.image).replace(
          /^\/+/,
          ""
        )}`
      : undefined);

  const description = (data.content || "")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .slice(0, 160);

  const canonical = `${SITE}/artikel-kesehatan/${slug}`;

  return {
    title: data.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.title,
      url: canonical,
      images: img ? [img] : [],
    },
  };
}

/* ===== Utils ===== */
function fmtLong(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ZONE,
  }).format(d);
}

/* ===== Share Buttons (pakai aset dari /public/icons/sosmed) ===== */
function ShareButtons({ url, title }) {
  const U = encodeURIComponent(url);
  const T = encodeURIComponent(title);

  const buttons = [
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${U}`,
      bg: "#1877F2",
      label: "Share",
      icon: "/icons/sosmed/facebook.svg",
      aria: "Share to Facebook",
    },
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
      bg: "#25D366",
      label: "Share",
      icon: "/icons/sosmed/whatsApp.svg",
      aria: "Share to WhatsApp",
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${U}`,
      bg: "#0A66C2",
      label: "Share",
      icon: "/icons/sosmed/linkedin.svg",
      aria: "Share to LinkedIn",
    },
    {
      href: `https://twitter.com/intent/tweet?url=${U}&text=${T}`,
      bg: "#000000",
      label: "Share",
      icon: "/icons/sosmed/twitter.svg",
      aria: "Share to X",
    },
    {
      href: `mailto:?subject=${T}&body=${U}`,
      bg: "#EA4335",
      label: "Share",
      icon: "/icons/sosmed/mail.svg",
      aria: "Share via Email",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-3xl mx-auto mt-20">
      {buttons.map((b, i) => (
        <a
          key={i}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-2 py-2 text-white font-semibold transition-transform hover:-translate-y-1"
          style={{ backgroundColor: b.bg }}
        >
          <img src={b.icon} alt="" className="h-7 w-7" />
          <span>Share</span>
        </a>
      ))}
    </div>
  );
}

/* ===== Page ===== */
export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return notFound();

  const img =
    data.imageUrl ||
    (data.image
      ? `${ASSET_BASE.replace(/\/$/, "")}/${String(data.image).replace(
          /^\/+/,
          ""
        )}`
      : "");

  const dateStr = data?.date ? fmtLong(data.date) : null;
  const canonical = `${SITE}/artikel-kesehatan/${slug}`;

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-12">
      {img ? (
        <img
          src={img}
          alt={data.title}
          className="w-full h-auto max-h-[520px] object-cover rounded-2xl shadow-md"
        />
      ) : null}

      <h1 className="mt-8 text-2xl md:text-3xl font-extrabold leading-relaxed text-center">
        {data.title}
      </h1>

      {dateStr ? (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: BRAND }}
          />
          <span>{dateStr}</span>
        </div>
      ) : null}

      <div className="mt-5 quill-viewer ql-snow max-w-5xl mx-auto">
        <div
          className="ql-editor max-w-none text-lg text-justify"
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </div>

      {/* Share row (pakai aset svg & animasi hover naik) */}
      <ShareButtons url={canonical} title={data.title} />
    </main>
  );
}
