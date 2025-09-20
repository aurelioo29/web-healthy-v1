import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    unoptimized: true,
  },
  // allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
