"use client";

import FooterAdmin from "@/components/auth/FooterAdmin";
import NavbarAdmin from "@/components/auth/NavbarAdmin";
import ScrollToTopLeft from "@/components/ScrollToTopLeft";
import withAuth from "@/middleware/withAuth";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarAdmin />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <ScrollToTopLeft offset={300} />
      <FooterAdmin owner="Royal Klinik" />
    </div>
  );
}

export default withAuth(DashboardLayout);
