"use client";

import Image from "next/image";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto max-w-7xl px-4 pb-4">
      <div className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
        {/* TOP: info area (white) */}
        <div className="bg-white px-6 py-8 md:px-20 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-11">
            {/* Logo */}
            <div className="md:col-span-3">
              <Link
                href="/"
                aria-label="Diagnos Home"
                className="inline-flex items-center gap-3"
              >
                <img
                  src="/images/home-pages/logo.svg"
                  alt="logo-website-healthy"
                  className="h-24 w-auto"
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
            <nav className="md:col-span-2">
              <h3 className="text-lg font-semibold ">{t("menu.title")}</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link href="/about" className=" hover:">
                    {t("menu.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/e-catalogue" className=" hover:">
                    {t("menu.ecatalogue")}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Call Center */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold ">
                {t("callcenter.title")}
              </h3>
              <div className="mt-3">
                <img
                  src="/images/home-pages/call-center.webp"
                  alt={t("callcenter.alt")}
                  className="h-14 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: dark bar */}
        <div className="bg-[#4698E3] px-6 py-8 text-white md:px-10 rounded-3xl">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            {/* Download app */}
            <div className="md:col-span-8">
              <p className="text-base font-semibold">{t("download.title")}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#" aria-label="Google Play">
                  <img
                    src="/images/home-pages/badge-playstore.webp"
                    alt="Get it on Google Play"
                    className="h-12 w-auto"
                  />
                </a>
                <a href="#" aria-label="App Store">
                  <img
                    src="/images/home-pages/badge-appstore.webp"
                    alt="Download on the App Store"
                    className="h-12 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="md:col-span-4 md:justify-self-end">
              <p className="text-base font-semibold">{t("social.title")}</p>
              <div className="mt-4 flex items-center gap-3">
                <SocialIcon href="#" label="Facebook">
                  <Facebook className="h-6 w-6" />
                </SocialIcon>
                <SocialIcon href="#" label="Instagram">
                  <Instagram className="h-6 w-6" />
                </SocialIcon>
                <SocialIcon href="#" label="YouTube">
                  <Youtube className="h-6 w-6" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-white/15" />

          {/* Copyright */}
          <div className="text-sm text-white">
            © {new Date().getFullYear()} {t("copyright")}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white transition hover:bg-gray-300 text-black"
    >
      {children}
    </a>
  );
}
