"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";
import api from "@/lib/axios";

const WA_PHONE = "6281161617181";
const buildWaLink = (msg) =>
  `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(
    msg
  )}`;

function DoctorCard({ doc }) {
  const ctaHref =
    doc.cta ||
    buildWaLink(
      `Hi Royal Klinik, saya ingin bertanya tentang Konsultasi Dokter (${doc.name} - ${doc.role}).`
    );

  return (
    <div className="flex h-full flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={doc.img}
          alt={doc.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 90vw, 30vw"
          priority={false}
        />
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-slate-900">{doc.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{doc.role}</p>

        {/* External link -> pakai <a>, bukan <Link> */}
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-14 inline-flex items-center justify-center rounded-xl bg-[#4698E3] px-5 py-2.5 text-white font-medium hover:bg-[#27537c] transition"
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
        // BE kamu: GET /upload/dokters?page=1&size=…&search=…
        const { data } = await api.get("/upload/dokters", {
          params: { page: 1, size: 12 },
          headers: { "Cache-Control": "no-cache" },
        });

        // Unwrap fleksibel
        const box = data?.data ?? data?.result ?? data ?? {};
        const list =
          box.dokters ||
          box.items ||
          box.rows ||
          box.list ||
          box.data ||
          (Array.isArray(data) ? data : []) ||
          [];

        const mapped = list.map((d) => ({
          name: d.name || d.title || d.full_name || d.nama || "Dokter",
          role: d.specialization || d.role || "Dokter",
          img: d.imageUrl || d.image || "/images/placeholder-doctor.png",
          // kalau BE suatu hari ngasih link khusus, hormati; else fallback WA
          cta: d.cta_link || "",
        }));

        setDoctors(mapped);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Gagal load dokter");
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

        {err && (
          <p className="mt-4 text-sm text-red-600">
            {err} — cek lagi payload BE & extractor.
          </p>
        )}

        {/* Skeleton simple biar nggak kering */}
        {loading && (
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
        )}

        {!loading && (
          <>
            {/* Mobile: Swiper */}
            <div className="mt-8 md:hidden">
              <Swiper
                modules={[Pagination]}
                className="doctors-swiper"
                slidesPerView={1}
                spaceBetween={16}
                pagination={{ clickable: true }}
              >
                {doctors.map((d, i) => (
                  <SwiperSlide key={i}>
                    <DoctorCard doc={d} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop: Grid */}
            <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
              {doctors.map((d, i) => (
                <DoctorCard key={i} doc={d} />
              ))}
            </div>
          </>
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
