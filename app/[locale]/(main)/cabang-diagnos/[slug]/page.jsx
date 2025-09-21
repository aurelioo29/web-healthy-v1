import Image from "next/image";
import { notFound } from "next/navigation";
import { branches, toSlug } from "@/data/branches";
import { MapPin, MessageCircle } from "lucide-react";
import MapFrame from "@/components/MapFrame";

const LOCALES = ["id", "en"];

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    branches.map((b) => ({ locale, slug: toSlug(b.name) }))
  );
}

export default async function BranchDetailPage({ params }) {
  const { slug } = await params;
  const branch = branches.find((b) => toSlug(b.name) === slug);
  if (!branch) return notFound();

  const waDigits = branch.whatsapp.replace(/\D/g, "");
  const waInternational = waDigits.startsWith("0")
    ? `62${waDigits.slice(1)}`
    : waDigits;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-14">
      <h1 className="text-3xl md:text-5xl font-extrabold">{branch.name}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="relative aspect-[16/9] md:h-[520px]">
            <Image
              src={branch.heroImg || "/images/lokasi-pages/undefined.png"}
              alt={branch.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="relative h-[280px] sm:h-[360px] md:h-[520px]">
            <MapFrame src={branch.mapEmbed} title={`Peta ${branch.name}`} />
          </div>
          <div className="p-4">
            <a
              href={`https://wa.me/${waInternational}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4698E3] px-4 py-2 font-semibold text-white hover:bg-[#538ec5] transition"
            >
              <MessageCircle className="h-5 w-5" />
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold">Informasi Umum</h2>
        <div className="mt-6 flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-700">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <div className="font-semibold">Kontak</div>
            <div className="text-slate-800">{branch.address}</div>
            <div className="text-slate-800">{branch.whatsapp}</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="font-semibold">Jam Buka</div>
          <ul className="mt-2 space-y-1 text-slate-800">
            {branch.hours?.map((h, i) => (
              <li key={i}>– {h}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <div className="font-semibold">Jenis Layanan</div>
          <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2 text-slate-800">
            {branch.services?.map((s, i) => (
              <li key={i}>– {s}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
