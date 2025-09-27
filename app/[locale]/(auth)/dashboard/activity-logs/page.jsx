"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import ActivityLogsTable from "./ActivityLogsTable";

export default function ActivityLogsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    axios
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data?.user;
        if (!user || user.role !== "superadmin") {
          router.replace("/dashboard"); // tendang balik
          return;
        }
        setMe(user);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking || !me) {
    return (
      <div className="min-h-[60vh] grid place-content-center text-slate-600">
        Checking access…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-900">Activity Logs</h1>
      <p className="mt-1 text-sm text-slate-600">
        Melihat aktivitas user yang mengakses dashboard
      </p>

      <div className="mt-6">
        <ActivityLogsTable />
      </div>
    </div>
  );
}
