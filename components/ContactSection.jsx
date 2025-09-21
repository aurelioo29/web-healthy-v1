"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export default function ContactSection() {
  const t = useTranslations("kontak");

  const waHref = useMemo(() => {
    try {
      const raw = t("whatsappNumber"); // contoh "08551500358"
      const digits = (raw || "").replace(/\D/g, "");
      const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
      return `https://wa.me/${intl}`;
    } catch {
      return "#";
    }
  }, [t]);

  return (
    <section className="w-full bg-[#4698E3]/10 my-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {/* KIRI: Map + Info */}
          <div className="overflow-hidden rounded-3xl bg-white shadow ring-1 ring-black/5">
            {/* Map responsif */}
            <div className="relative w-full aspect-[16/9]">
              <iframe
                title={t("mapTitle")}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9532433164536!2d98.65129887581308!3d3.5981886502265334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30312e217b89250b%3A0xfbebeb4b31eefd13!2sRumah%20Sakit%20Universitas%20Royal%20Prima!5e0!3m2!1sid!2sid!4v1758432267423!5m2!1sid!2sid"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div className="p-6 sm:p-7 space-y-5">
              <Item
                icon={<MapPin className="h-5 w-5" />}
                title={t("addressLabel")}
                body={t("addressFull")}
              />
              <Item
                icon={<MessageCircle className="h-5 w-5" />}
                title={t("whatsappLabel")}
                body={
                  <a href={waHref} className="hover:underline">
                    {t("whatsappNumber")}
                  </a>
                }
              />
              <Item
                icon={<Phone className="h-5 w-5" />}
                title={t("phoneLabel")}
                body={
                  <a
                    href={`tel:${t("phoneNumber")}`}
                    className="hover:underline"
                  >
                    {t("phoneNumber")}
                  </a>
                }
              />
              <Item
                icon={<Mail className="h-5 w-5" />}
                title={t("emailLabel")}
                body={
                  <a
                    href={`mailto:${t("emailAddress")}`}
                    className="hover:underline"
                  >
                    {t("emailAddress")}
                  </a>
                }
              />
            </div>
          </div>

          {/* KANAN: Form */}
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow ring-1 ring-black/5">
            <h2 className="text-2xl font-bold">{t("form.title")}</h2>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                console.log("Contact form:", data);
                alert(t("form.thanks"));
              }}
            >
              {/* Nama */}
              <Field label={`${t("form.name")} *`} id="name">
                <input
                  id="name"
                  name="name"
                  required
                  placeholder={t("form.placeholder.name")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4698E3]"
                />
              </Field>

              {/* Email */}
              <Field label={`${t("form.email")} *`} id="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t("form.placeholder.email")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4698E3]"
                />
              </Field>

              {/* HP */}
              <Field label={`${t("form.phone")} *`} id="phone">
                <input
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  required
                  placeholder={t("form.placeholder.phone")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4698E3]"
                />
              </Field>

              {/* Perihal */}
              <Field label={t("form.subject")} id="subject">
                <select
                  id="subject"
                  name="subject"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[#4698E3]"
                  defaultValue="brand"
                >
                  <option value="brand">{t("form.subjects.brand")}</option>
                  <option value="corporate">
                    {t("form.subjects.corporate")}
                  </option>
                  <option value="general">{t("form.subjects.general")}</option>
                </select>
              </Field>

              {/* Pesan */}
              <Field label="" id="message">
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={t("form.placeholder.message")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </Field>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[#4698E3] px-4 py-2.5 text-white font-medium hover:bg-[#4698E3] transition cursor-pointer"
              >
                {t("form.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ icon, title, body }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#4698E3] text-white">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-slate-700">{body}</div>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <label htmlFor={id} className="block">
      {label && (
        <div className="mb-1 text-sm font-medium text-slate-800">{label}</div>
      )}
      {children}
    </label>
  );
}
