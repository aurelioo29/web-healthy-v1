"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import "quill/dist/quill.snow.css";
import "../../keberlanjutan/[slug]/QuillViewer.css";
import Image from "next/image";

const BRAND = "#4698E3";
const ZONE = "Asia/Jakarta";

const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: ZONE,
  }).format(d);
};

export default function LabTestDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await api.get(`/upload/lab-tests/${slug}`);
        setData(data?.data || null);
      } catch (e) {
        setErr(e?.response?.data?.message || "Data tidak ditemukan");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <div className="h-8 w-2/3 rounded bg-slate-200 animate-pulse" />
        <div className="mt-6 h-64 rounded bg-slate-100 animate-pulse" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {err || "Tidak ditemukan."}
        </p>
      </main>
    );
  }

  const dateStr = data?.date ? fmtDate(data.date) : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      {/* HERO: judul di atas gambar (gambar jadi background) */}
      <section className="relative w-full h-[240px] md:h-[340px] lg:h-[420px] overflow-hidden rounded-2xl ring-1 ring-black/5">
        <Image
          src="/images/tes-lab-pages/Hero-Detail.webp"
          alt="Hero Detail"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* judul overlay */}
        <div className="absolute inset-0 grid place-items-center px-4">
          <h1 className="text-black text-center font-extrabold leading-tight text-2xl md:text-4xl drop-shadow-md">
            {data.title}
          </h1>
        </div>
      </section>

      {/* Tanggal di bawah gambar */}
      {dateStr ? (
        <div className="mt-4 flex justify-center items-center gap-2 text-sm text-slate-600">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: BRAND }}
          />
          <span>{dateStr}</span>
        </div>
      ) : null}

      {/* Konten */}
      <div className="mt-6 quill-viewer ql-snow max-w-4xl mx-auto">
        <div
          className="ql-editor max-w-none text-lg"
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </div>
    </main>
  );
}
