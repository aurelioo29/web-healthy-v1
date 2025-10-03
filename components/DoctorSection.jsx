"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function DoctorCard({ doc }) {
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

        <Link
          href={doc.cta || "#"}
          className="mt-14 inline-flex items-center justify-center rounded-xl bg-[#4698E3] px-5 py-2.5 text-white font-medium hover:bg-[#27537c] transition"
        >
          Jadwalkan Konsultasi
        </Link>
      </div>
    </div>
  );
}

export default function DoctorsSection() {
  const DOCTORS = [
    {
      name: "dr. Carla Edhina Widiadi",
      role: "Dokter Umum",
      img: "/images/konsultasi-pages/dr-carla.webp",
      cta: "/konsultasi",
    },
    {
      name: "dr. Eko Bastiansyah",
      role: "Dokter Umum",
      img: "/images/konsultasi-pages/dr-eko.webp",
      cta: "/konsultasi",
    },
    {
      name: "Dr. dr. Nurin A. Listyasari, Msi. Med",
      role: "Konselor Genetik",
      img: "/images/konsultasi-pages/dr-nurin.png",
      cta: "/konsultasi",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold md:text-4xl">
          Dokter dari Royal Klinik
        </h2>

        {/* Mobile: Swiper */}
        <div className="mt-8 md:hidden">
          <Swiper
            modules={[Pagination]}
            className="doctors-swiper"
            slidesPerView={1}
            spaceBetween={16}
            pagination={{ clickable: true }}
          >
            {DOCTORS.map((d, i) => (
              <SwiperSlide key={i}>
                <DoctorCard doc={d} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop: Grid */}
        <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
          {DOCTORS.map((d, i) => (
            <DoctorCard key={i} doc={d} />
          ))}
        </div>
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
