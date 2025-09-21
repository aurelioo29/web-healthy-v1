"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function StepCard({ icon, title }) {
  return (
    <div className="text-center mt-10">
      <div className="mx-auto mb-4 grid h-20 w-20 place-content-center rounded-2xl bg-[#4698E3]/10">
        <Image src={icon} alt="" width={44} height={44} />
      </div>
      <h4 className="font-semibold text-slate-900">{title}</h4>
    </div>
  );
}

function Connector() {
  return (
    <div
      aria-hidden
      className="hidden md:block h-[3px] w-56 self-center rounded bg-[#4698E3] -translate-y-6"
    />
  );
}

export default function HomecareCall() {
  const t = useTranslations("homecareHowTo");

  const steps = [
    {
      icon: t("steps.s1.icon"),
      title: t("steps.s1.title"),
    },
    {
      icon: t("steps.s2.icon"),
      title: t("steps.s2.title"),
    },
    {
      icon: t("steps.s3.icon"),
      title: t("steps.s3.title"),
    },
    {
      icon: t("steps.s4.icon"),
      title: t("steps.s4.title"),
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold md:text-3xl text-slate-900">
          {t("title")}
        </h2>
        <p className="mt-2 text-center text-slate-600">{t("subtitle")}</p>

        {/* Desktop layout */}
        <div className="mt-10 hidden md:flex items-stretch justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <StepCard {...s} />
              {i < steps.length - 1 && <Connector />}
            </div>
          ))}
        </div>

        {/* Mobile: Swiper */}
        <div className="mt-8 md:hidden">
          <Swiper
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={14}
            pagination={{ clickable: true, dynamicBullets: true }}
            watchOverflow
            speed={500}
            className="!pb-8"
            style={{
              "--swiper-pagination-bottom": "0px",
              "--swiper-pagination-bullet-size": "8px",
              "--swiper-pagination-bullet-horizontal-gap": "6px",
              "--swiper-pagination-color": "#4698E3",
              "--swiper-pagination-bullet-inactive-color": "#cbd5e1",
              "--swiper-pagination-bullet-inactive-opacity": "1",
            }}
            breakpoints={{
              400: { slidesPerView: 1.2, spaceBetween: 16 },
            }}
          >
            {steps.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="my-5">
                  <StepCard {...s} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
