"use client";

import React from "react";
import { Link, usePathname } from "@/lib/navigation";
import { useLocale } from "next-intl";

export default function LocaleSwitcher({ className = "" }) {
  const locale = useLocale();
  const pathname = usePathname();

  const Item = ({ loc, label }) => {
    const active = locale === loc;
    return (
      <Link
        href={pathname}
        locale={loc}
        className={`px-1.5 text-lg font-semibold transition-opacity ${
          active
            ? "text-teal-100 opacity-300"
            : "text-white/90 hover:opacity-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div
      className={"inline-flex items-center gap-1 px-2 py-1 " + className}
      aria-label="Language switcher"
    >
      <Item loc="en" label="EN" />
      <span className="text-white/50">|</span>
      <Item loc="id" label="ID" />
    </div>
  );
}
