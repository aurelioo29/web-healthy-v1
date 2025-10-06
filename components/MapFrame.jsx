import React from "react";

export default function MapFrame({ src, title }) {
  return (
    <iframe
      src={src}
      title={title}
      className="absolute inset-0 h-full w-full"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
