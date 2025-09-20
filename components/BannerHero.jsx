"use client";
import Image from "next/image";

export default function BannerHero() {
  return (
    <section className="mx-auto my-5 max-w-7xl px-2 md:px-0">
      <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
        <div className="relative aspect-[21/9]">
          <Image
            src="/images/home-pages/banner-hero.webp"
            alt="banner"
            fill
            priority
            quality={85}
            sizes="(min-width: 1280px) 1200px, (min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
