import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "id"],
  defaultLocale: "id",
  localePrefix: "never", // <— kunci
  localeDetection: true, // baca dari cookie / header
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
