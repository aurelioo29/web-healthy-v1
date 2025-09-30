import { notFound } from "next/navigation";
import "quill/dist/quill.snow.css";
import "./QuillViewer.css";

const ZONE = "Asia/Jakarta";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
const BRAND = "#4698E3";

async function getData(slug) {
  const res = await fetch(`${API_BASE}/upload/csr/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return { title: "CSR Not Found" };

  return {
    title: data.title,
    description: (data.content || "").replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: {
      title: data.title,
      images: [
        data.imageUrl
          ? data.imageUrl
          : data.imageitu
          ? `${ASSET_BASE.replace(/\/$/, "")}/${data.image.replace(/^\/+/, "")}`
          : undefined,
      ].filter(Boolean),
    },
  };
}

export default async function CSRDetailPage({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return notFound();

  const fmtDate = (iso, localeTag) => {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    return new Intl.DateTimeFormat(localeTag, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: ZONE,
    }).format(d);
  };

  const img =
    data.imageUrl ||
    (data.image
      ? `${ASSET_BASE.replace(/\/$/, "")}/${data.image.replace(/^\/+/, "")}`
      : "");

  const dateStr = data?.date ? fmtDate(data.date) : null;

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
          <span>{dateStr}</span>{" "}
        </div>
      ) : null}

      <div className="mt-5 quill-viewer ql-snow max-w-5xl mx-auto">
        <div
          className="ql-editor max-w-none text-lg text-justify"
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </div>
    </main>
  );
}
