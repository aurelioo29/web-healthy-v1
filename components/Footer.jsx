"use client";

import Image from "next/image";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube, Whats } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto max-w-7xl px-4 pb-4">
      <div className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
        {/* TOP: info area (white) */}
        <div className="bg-white px-6 py-8 md:px-20 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Logo */}
            <div className="md:col-span-3">
              <Link
                href="/"
                aria-label="Royal Home"
                className="inline-flex items-center gap-3"
              >
                <img
                  src="/images/home-pages/logo.svg"
                  alt="logo-website-healthy"
                  className="h-28 w-auto"
                />
              </Link>
            </div>

            {/* Headquarters */}
            <div className="md:col-span-4 mt-10 md:mt-0">
              <h3 className="text-lg font-semibold ">
                {t("headquarters.title")}
              </h3>
              <p className="mt-2 font-medium">{t("headquarters.name")}</p>
              <p className="mt-1 max-w-xs">{t("headquarters.address")}</p>
            </div>

            {/* Menu */}
            <nav className="md:col-span-2 mt-3 md:mt-0">
              <h3 className="text-lg font-semibold ">{t("menu.title")}</h3>
              <ul className="mt-3 space-y-3">
                <li>
                  <Link href="/tentang-kami" className=" hover:">
                    {t("menu.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/e-catalog" className=" hover:">
                    {t("menu.ecatalogue")}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Call Center */}
            <div className="md:col-span-2 mt-3 md:mt-0">
              <h3 className="text-lg font-semibold">{t("callcenter.title")}</h3>

              {/* deretan tombol WA (sebaris, wrap kalau sempit) */}
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <SocialIcon href="https://wa.me/6281161617181" label="WhatsApp">
                  <img
                    src="/icons/sosmed/whatsApp.svg"
                    alt=""
                    className="h-7 w-7"
                  />
                  <span className="">0811-6161-7181</span>
                </SocialIcon>

                <SocialIcon href="https://wa.me/6281161617180" label="WhatsApp">
                  <img
                    src="/icons/sosmed/whatsApp.svg"
                    alt=""
                    className="h-7 w-7"
                  />
                  <span className="">0811-6161-7180</span>
                </SocialIcon>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: dark bar */}
        <div className="bg-gradient-to-br from-[#17767C] via-[#2B8C6D] to-[#349468] px-6 py-8 text-white md:px-10 rounded-3xl">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            {/* Download app */}
            <div className="md:col-span-8">
              <p className="text-base font-semibold">{t("download.title")}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#" aria-label="Google Play">
                  <img
                    src="/images/home-pages/badge-playstore.webp"
                    alt="Get it on Google Play"
                    className="h-14 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="md:col-span-3 md:justify-self-end">
              <p className="text-base font-semibold">{t("social.title")}</p>
              <div className="mt-4 flex items-center gap-3">
                <SocialIcon
                  href="https://www.tiktok.com/@royal.klinik"
                  label="Tiktok"
                >
                  <img
                    src="/icons/sosmed/tik-tok.png"
                    alt=""
                    className="h-5 w-5 shrink-0"
                  />
                </SocialIcon>
                <SocialIcon
                  href="https://www.instagram.com/royalklinikcemara"
                  label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-white/15" />

          {/* Copyright */}
          <div className="text-sm text-white">
            © {t("copyright")} {new Date().getFullYear()}. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children, className = "" }) {
  return (
    <a
      href={href}
      aria-label={label}
      className={
        "inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 " +
        "text-sm text-black whitespace-nowrap " +
        className
      }
    >
      {children}
    </a>
  );
}
