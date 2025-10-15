"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";
import ImagePicker from "./ImagePicker";
import Swal from "sweetalert2";

const BRAND = "#4698E3";

export default function CategoryLabTestFormModal({
  open,
  onClose,
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const dlgRef = useRef(null);

  // reset ketika modal dibuka / data berubah
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPreview(initialData.imageUrl || "");
      setFile(null);
    } else {
      setName("");
      setDescription("");
      setFile(null);
      setPreview("");
    }
  }, [open, initialData]);

  // ESC untuk tutup
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", name);
      if (description) fd.append("description", description);
      // Hanya kirim file jika user memilih gambar baru
      if (file) fd.append("image", file);

      if (mode === "edit" && initialData?.id) {
        await api.put(`/upload/category-lab-tests/${initialData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/upload/category-lab-tests`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Submit failed",
        text: err?.response?.data?.message || "Submit failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 grid place-items-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <form
        ref={dlgRef}
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-5"
      >
        <h3 className="text-lg font-bold">
          {mode === "edit" ? "Edit Category Lab Test" : "New Category Lab Test"}
        </h3>

        <div className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-slate-700">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              placeholder="Input category name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-[#4698E3]"
              placeholder="Description (optional)"
            />
          </div>

          {/* Image (pakai ImagePicker) */}
          <div>
            <div className="mt-1">
              <ImagePicker
                accept="image/*"
                // preview awal saat edit (atau dari state kalau user sudah pilih)
                previewUrl={preview || initialData?.imageUrl || ""}
                // file yang sedang dipilih (optional, kalau komponenmu memakainya)
                value={file}
                // dipanggil ketika user memilih / menghapus gambar
                onChange={(f) => {
                  setFile(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPreview(url);
                  } else {
                    setPreview(initialData?.imageUrl || "");
                  }
                }}
                // opsi: batasi tinggi preview agar tidak “zoom”
                previewClassName="h-40 w-full object-contain rounded-lg ring-1 ring-slate-200 bg-slate-50"
                // opsi: tampilkan border + icon di picker
                pickerClassName="rounded-lg ring-1 ring-slate-200 hover:ring-[#4698E3]/60"
              />
            </div>
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
