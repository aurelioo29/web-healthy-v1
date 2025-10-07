"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

const BRAND = "#4698E3";

export default function RoleModal({ open, onClose, user, onSaved }) {
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const r =
      String(user?.role || "").toLowerCase() === "superadmin"
        ? "Superadmin"
        : "Admin";
    setRole(r);
  }, [open, user]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // kirim "role" huruf kecil ke server (admin|superadmin)
      await api.put(`/users/${user.id}/role`, {
        role: role.toLowerCase(),
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan role user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 grid place-items-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">Update Role</h3>
        <p className="mt-1 text-sm text-slate-600">
          {user?.username} &middot; {user?.email}
        </p>

        <div className="mt-4">
          <label className="text-sm text-slate-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
          >
            <option>Admin</option>
            <option>Superadmin</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="px-3 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ background: BRAND }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
