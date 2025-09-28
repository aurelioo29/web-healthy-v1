"use client";
import { useEffect, useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

const BRAND = "#4698E3";

export default function ImagePicker({ value, onChange, label = "Image" }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    onChange?.(f);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>

      {/* picker */}
      <label
        className="flex items-center gap-3 w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 hover:border-[#4698E3] transition"
      >
        <div
          className="grid h-10 w-10 place-content-center rounded-lg"
          style={{ background: `${BRAND}15`, color: BRAND }}
        >
          <UploadCloud className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-800">Choose File</div>
          <div className="text-xs text-slate-500">
            JPG, PNG, WEBP (max ~5MB)
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      </label>

      {/* nama file */}
      {file && (
        <div className="mt-1 text-xs text-slate-600 truncate">{file.name}</div>
      )}

      {/* preview tidak nge-zoom */}
      {preview && (
        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-contain"
          />
        </div>
      )}

      {/* fallback ikon saat belum ada preview */}
      {!preview && (
        <div className="mt-3 grid place-content-center h-32 rounded-xl ring-1 ring-slate-200 bg-slate-50 text-slate-400">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}
