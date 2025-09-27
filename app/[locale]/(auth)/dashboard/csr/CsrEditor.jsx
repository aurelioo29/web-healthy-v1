"use client";

import React, { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "./CsrEditor.css";
import Quill from "quill";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
  "image",
  "color",
  "background",
  "align",
];

export default function CsrEditor({
  value = "",
  onChange,
  placeholder = "Write your CSR content…",
  height = 280,
}) {
  const hostRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return;
    const q = new Quill(hostRef.current, {
      theme: "snow",
      modules,
      formats,
      placeholder,
    });
    quillRef.current = q;

    q.on("text-change", () => {
      const html = q.root.innerHTML;
      onChange?.(html);
    });
  }, [placeholder, onChange]);

  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const current = q.root.innerHTML || "";
    const next = value || "";
    if (current !== next) {
      q.clipboard.dangerouslyPasteHTML(next, "silent");
      const len = q.getLength();
      q.setSelection(len, 0, "silent");
    }
  }, [value]);

  return (
    <div
      ref={hostRef}
      style={{ height }}
      className="ql-host border-none [&_.ql-container]:h-full [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-[15px] [&_.ql-editor]:leading-6"
    />
  );
}
