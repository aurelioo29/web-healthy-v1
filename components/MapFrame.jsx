import React from "react";

export default function MapFrame({ src, title }) {
  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-black/5">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
