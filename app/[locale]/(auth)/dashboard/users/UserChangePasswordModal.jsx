"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Swal from "sweetalert2";

const BRAND = "#4698E3";

function parseApiError(error) {
  const res = error?.response?.data;
  if (!res) return error?.message || "Request failed";
  const { message, errors } = res;
  if (errors) {
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors))
      return errors
        .map((e) => e?.msg || e?.message || e)
        .filter(Boolean)
        .join("\n");
    if (typeof errors === "object") return Object.values(errors).join("\n");
  }
  return message || "Request failed";
}

export default function ChangePasswordModal({ open, onClose, user, onSaved }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [requireOld, setRequireOld] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setConfirm("");
    setOldPassword("");
    // Kamu bisa otomatis mewajibkan old password bila yang diubah adalah diri sendiri.
    setRequireOld(false);
  }, [open, user]);

  if (!open || !user) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      await Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Password minimal 8 karakter.",
      });
      return;
    }
    if (password !== confirm) {
      await Swal.fire({
        icon: "error",
        title: "Oops",
        text: "Konfirmasi password tidak sama.",
      });
      return;
    }

    try {
      setLoading(true);

      // payload umum Laravel/Node
      const body = {
        password,
        password_confirmation: confirm,
        ...(requireOld && oldPassword ? { old_password: oldPassword } : {}),
      };

      // Utama: PATCH /users/:id/password
      await api.patch(`/users/${user.id}/password`, body);

      // (opsional fallback) kalau server pakai PUT:
      // await api.put(`/users/${user.id}/password`, body);

      onSaved?.();
      onClose?.();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Gagal mengubah password",
        text: parseApiError(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 grid place-items-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">Change Password</h3>
        <p className="mt-1 text-sm text-slate-600">
          Ubah password untuk{" "}
          <span className="font-semibold">
            {user.username || user.email || `#${user.id}`}
          </span>
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="require-old"
              type="checkbox"
              className="h-4 w-4"
              checked={requireOld}
              onChange={(e) => setRequireOld(e.target.checked)}
            />
            <label htmlFor="require-old" className="text-sm text-slate-700">
              Minta current password
            </label>
          </div>

          {requireOld && (
            <div>
              <label className="text-sm text-slate-700">Current password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
                autoComplete="current-password"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-slate-700">New password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              autoComplete="new-password"
              minLength={8}
              placeholder="Min. 8 karakter"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">
              Confirm new password
            </label>
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
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
