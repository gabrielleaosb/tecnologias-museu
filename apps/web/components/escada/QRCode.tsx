"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ valor, tamanho = 160 }: { valor: string; tamanho?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(valor, { width: tamanho, margin: 1 }).then(setDataUrl);
  }, [valor, tamanho]);

  if (!dataUrl) return <div style={{ width: tamanho, height: tamanho }} className="animate-pulse rounded-md bg-black/10" />;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={tamanho} height={tamanho} />;
}
