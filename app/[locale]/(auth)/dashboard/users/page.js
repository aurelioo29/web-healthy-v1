"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

import UserTable from "./UserTable";

export default function DashboardManageUserPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const roleLS =
      typeof window !== "undefined" ? localStorage.getItem("role") : null;

    if (!token) {
      router.replace("/login?next=/dashboard/users");
      return;
    }
    if (roleLS && roleLS !== "superadmin") {
      router.replace("/dashboard");
      return;
    }

    axios
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const role = res?.data?.user?.role;
        if (role !== "superadmin") {
          router.replace("/dashboard");
        } else {
          setAllowed(true);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.replace("/login?next=/dashboard/users");
      })
      .finally(() => setChecking(false));
  }, [router]);

  // Sembunyikan konten saat cek/redirect
  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-600">
        Checking access…
      </div>
    );
  }
  if (!allowed) return null; // lagi redirect

  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
      <p className="mt-1 text-sm text-slate-600">
        Tersambung ke BE • query: <code>?search=&amp;size=&amp;page=</code>
      </p>
      <div className="mt-6">
        <UserTable />
      </div>
    </div>
  );
}
