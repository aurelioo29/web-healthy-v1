import { Inter } from "next/font/google";
import "../../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard - Royal Klinik",
  description: "Website company profile dari Royal Klinik",
  icons: {
    icon: [
      { url: "/images/home-pages/logo.svg", type: "image/svg+xml" }, // ← tanpa /public
    ],
  },
};

export default async function AuthLayout({ children }) {
  return (
    <html className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
