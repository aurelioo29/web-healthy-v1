import { Inter } from "next/font/google";
import "../../globals.css";
import { NextIntlClientProvider } from "next-intl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopLeft from "@/components/ScrollToTopLeft";
import WhatsAppWidgetClient from "@/components/WhatsAppWidgetClient"; // ⬅️ wrapper client
import SplashScreen from "@/components/SplashScreen";

export const dynamicParams = false;
const SUPPORTED_LOCALES = ["id", "en"];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata = {
  title: "Royal Klinik",
  description: "Website company profile dari Royal Klinik",
  icons: {
    icon: [
      { url: "/images/home-pages/logo.svg", type: "image/svg+xml" }, // ← tanpa /public
    ],
  },
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SplashScreen />
          <Navbar />
          {children}
          <ScrollToTopLeft offset={300} />
          <Footer />
          <WhatsAppWidgetClient
            phone="+6281161617181"
            message="Halo sobat Royal Klinik, 👋 ada yang bisa kami bantu?"
            brand="#25D366"
            label="WhatsApp"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
