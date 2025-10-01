"use client";
import Image from "next/image";
import Link from "next/link";

export default function BannerHero() {
  return (
    <section className="mx-auto my-5 max-w-7xl px-2 md:px-0">
      <div className="relative overflow-hidden rounded-3xl md:rounded-2xl">
        <div className="relative aspect-[21/9]">
          <Link href="/panel-pemeriksaan">
            <Image
              src="/images/home-pages/banner-hero.webp"
              alt="banner"
              sizes="(min-width: 1280px) 1200px, (min-width: 768px) 768px, 100vw"
              className="object-cover"
              loading="lazy"
              fill
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
