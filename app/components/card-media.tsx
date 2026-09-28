"use client";

import { useEffect, useRef, useState } from "react";

// Card media with a skeleton placeholder: a light-grey block shows until the
// image has loaded, then the image fades in over it (smooth reveal).
export default function CardMedia({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const handleLoad = () => setLoaded(true);
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    } else {
      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleLoad);
      return () => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleLoad);
      };
    }
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`aspect-[678/368] w-full object-cover transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
