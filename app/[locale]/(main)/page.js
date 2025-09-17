"use client";

import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div>
      <header className="flex justify-end p-4">
        <LocaleSwitcher />
      </header>
      <h1>{t("title")}</h1>
    </div>
  );
}
