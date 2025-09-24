"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function withAuth(Component) {
  return function ProtectedPage(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; // detik

        if (decoded.exp < now) {
          // token expired
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          setLoading(false); // token masih valid → render page
        }
      } catch (err) {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    }, [router]);

    if (loading) {
      return <div className="min-h-screen bg-white"></div>; // putih kosong
    }

    return <Component {...props} />;
  };
}
