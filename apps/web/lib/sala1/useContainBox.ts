"use client";

import { useEffect, useState } from "react";

export function useContainBox(ratio: number) {
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function calcular() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const larguraSeLimitadaPelaAltura = vh * ratio;

      if (larguraSeLimitadaPelaAltura <= vw) {
        setBox({ width: larguraSeLimitadaPelaAltura, height: vh });
      } else {
        setBox({ width: vw, height: vw / ratio });
      }
    }

    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [ratio]);

  return box;
}
