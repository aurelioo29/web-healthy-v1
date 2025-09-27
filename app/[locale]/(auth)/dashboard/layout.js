"use client";

import FooterAdmin from "@/components/auth/FooterAdmin";
import NavbarAdmin from "@/components/auth/NavbarAdmin";
import ScrollToTopLeft from "@/components/ScrollToTopLeft";
import withAuth from "@/middleware/withAuth";

function DashboardLayout({ children }) {
  return (
    <>
      <NavbarAdmin />
      <main className="pt-16 max-w-7xl mx-auto p-6">{children}</main>
      <ScrollToTopLeft offset={300} />
      <FooterAdmin owner="Aurelio" />
    </>
  );
}

export default withAuth(DashboardLayout);
