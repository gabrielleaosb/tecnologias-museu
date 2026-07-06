"use client";

import Image from "next/image";
import type { Hotspot } from "@/lib/sala1/hotspots";
import { useContainBox } from "@/lib/sala1/useContainBox";

const RATIO = 8337 / 5004;
const DEBUG = process.env.NEXT_PUBLIC_SALA1_DEBUG === "1";

interface HotspotImageProps {
  src: string;
  alt: string;
  hotspots: readonly Hotspot[];
  onHotspot: (id: string) => void;
}

export function HotspotImage({ src, alt, hotspots, onHotspot }: HotspotImageProps) {
  const box = useContainBox(RATIO);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      {box.width > 0 && (
        <div className="relative" style={{ width: box.width, height: box.height }}>
          <Image src={src} alt={alt} fill priority className="object-fill" sizes="100vw" />
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              aria-label={hotspot.id}
              onClick={() => onHotspot(hotspot.id)}
              className={DEBUG ? "absolute border-2 border-red-500 bg-red-500/25" : "absolute active:bg-white/10"}
              style={{
                left: `${hotspot.left}%`,
                top: `${hotspot.top}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
            >
              {DEBUG && <span className="text-xs font-bold text-white">{hotspot.id}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
