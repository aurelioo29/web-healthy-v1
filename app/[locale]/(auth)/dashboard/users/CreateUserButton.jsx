"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, X, AlertTriangle } from "lucide-react";

export default function CreateUserButton({ onSuccess, currentRole = "" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);

  const [fieldErr, setFieldErr] = useState({});
  const [globalErr, setGlobalErr] = useState("");

  // superadmin/admin tidak boleh membuat developer
  const roleOptions =
    currentRole === "developer"
      ? ["admin", "superadmin", "developer"]
      : ["admin", "superadmin"];

  // pastikan value role valid
  useEffect(() => {
    if (!roleOptions.includes(form.role)) {
      setForm((s) => ({ ...s, role: "admin" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (fieldErr[name]) {
      const next = { ...fieldErr };
      delete next[name];
      setFieldErr(next);
    }
  };

  const close = () => {
    setOpen(false);
    setForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
    });
    setFieldErr({});
    setGlobalErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErr({});
    setGlobalErr("");

    try {
      await api.post("/auth/create-users", form);
      close();
      onSuccess?.();
    } catch (error) {
      const data = error?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        if (data.errors.undefined && !data.errors._global) {
          data.errors._global = data.errors.undefined;
          delete data.errors.undefined;
        }
        setFieldErr(data.errors);
        setGlobalErr(data.errors._global || "");
      } else if (data?.message) {
        setGlobalErr(data.message);
      } else {
        setGlobalErr(error.message || "Request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer"
      >
        <Plus className="h-4 w-4" /> Create User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Create User
              </h3>
              <button
                onClick={close}
                className="rounded-md p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {globalErr && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="text-sm">{globalErr}</div>
              </div>
            )}

            <form className="space-y-3" onSubmit={submit} noValidate>
              <div>
                <label className="text-sm text-slate-700">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                    fieldErr.username ? "ring-rose-300" : "ring-slate-200"
                  }`}
                  required
                />
                {fieldErr.username && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErr.username}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                    fieldErr.email ? "ring-rose-300" : "ring-slate-200"
                  }`}
                  required
                />
                {fieldErr.email && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErr.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                      fieldErr.password ? "ring-rose-300" : "ring-slate-200"
                    }`}
                    required
                  />
                  {fieldErr.password && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErr.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                      fieldErr.confirmPassword
                        ? "ring-rose-300"
                        : "ring-slate-200"
                    }`}
                    required
                  />
                  {fieldErr.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErr.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-lg ring-1 px-3 py-2 text-sm outline-none focus:ring-sky-400 ${
                    fieldErr.role ? "ring-rose-300" : "ring-slate-200"
                  }`}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r === "admin"
                        ? "Admin"
                        : r === "superadmin"
                        ? "Superadmin"
                        : "Developer"}
                    </option>
                  ))}
                </select>
                {fieldErr.role && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErr.role}</p>
                )}
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>

            {Object.entries(fieldErr).filter(
              ([k]) =>
                ![
                  "username",
                  "email",
                  "password",
                  "confirmPassword",
                  "role",
                  "_global",
                ].includes(k)
            ).length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <div className="text-xs font-medium">Other errors:</div>
                <ul className="mt-1 list-disc pl-4 text-xs">
                  {Object.entries(fieldErr)
                    .filter(
                      ([k]) =>
                        ![
                          "username",
                          "email",
                          "password",
                          "confirmPassword",
                          "role",
                          "_global",
                        ].includes(k)
                    )
                    .map(([k, v]) => (
                      <li key={k}>
                        <span className="font-mono">{k}</span>: {v}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
