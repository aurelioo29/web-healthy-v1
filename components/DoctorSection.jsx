"use client";

import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const WA_PHONE = "6281161617181";
const buildWaLink = (msg) =>
  `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(
    msg
  )}`;

const IMAGE_BASE = "http://192.168.0.103:8000/storage/assets";

function DoctorCard({ doc }) {
  const ctaHref =
    doc.cta ||
    buildWaLink(
      `Hi Royal Klinik, saya ingin bertanya tentang Konsultasi Dokter (${doc.name} - ${doc.role}).`
    );
  const [src, setSrc] = React.useState(doc.img);

  return (
    <div className="flex h-full flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={src}
          alt={doc.name}
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-contain"
          onError={() => setSrc("/images/placeholder-doctor.png")}
          priority={false}
        />
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-slate-900">{doc.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{doc.role}</p>

        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-14 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-5 py-2.5 text-white font-medium hover:bg-[#24584F] transition"
        >
          Jadwalkan Konsultasi
        </a>
      </div>
    </div>
  );
}

export default function DoctorsSection() {
  const [doctors, setDoctors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const r = await fetch("/api/doctors", { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const list = await r.json();

        const mapped = (list || []).map((d) => ({
          id: d.id,
          name: d.nama_dokter || d.name || "Dokter",
          role: d.spesialisasi || d.specialization || "Dokter",
          img: d.foto
            ? `${IMAGE_BASE.replace(/\/$/, "")}/${String(d.foto).replace(
                /^\//,
                ""
              )}`
            : "/images/placeholder-doctor.png",
        }));
        setDoctors(mapped);
      } catch (e) {
        setErr(e.message || "Gagal load dokter");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold md:text-4xl">
          Dokter dari Royal Klinik
        </h2>

        {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

        {loading ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-[420px] rounded-3xl border border-slate-200 bg-white p-6"
              >
                <div className="w-full h-[300px] bg-slate-100 rounded-2xl" />
                <div className="mt-4 h-4 w-2/3 bg-slate-100 rounded" />
                <div className="mt-2 h-3 w-1/3 bg-slate-100 rounded" />
                <div className="mt-8 h-9 w-1/2 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <Swiper
              modules={[Pagination]}
              className="doctors-swiper"
              pagination={{ clickable: true }}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
            >
              {doctors.map((d) => (
                <SwiperSlide key={d.id ?? d.name}>
                  <DoctorCard doc={d} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <style jsx global>{`
        .doctors-swiper .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: #94a3b8;
          opacity: 1;
        }
        .doctors-swiper .swiper-pagination-bullet-active {
          background: #4698e3;
        }
        .doctors-swiper .swiper-pagination {
          bottom: -6px;
        }
      `}</style>
    </section>
  );
}
