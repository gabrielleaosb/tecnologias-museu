"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import { assets, buscarTema } from "@/lib/sala1/temas";
import type { Estado } from "@/lib/sala1/estado";

function videoDoEstado(estado: Estado): { src: string; loop: boolean; avisaFim: boolean } {
  switch (estado.tipo) {
    case "standby":
      return { src: assets.standby.video, loop: true, avisaFim: false };
    case "menu":
      return {
        src: estado.variante === "apos-sim" ? assets.menuAposSim.video : assets.menu.video,
        loop: false,
        avisaFim: false,
      };
    case "tema":
      return { src: buscarTema(estado.temaId).video, loop: false, avisaFim: true };
    case "fim-video":
      return { src: assets.fimVideo.video, loop: false, avisaFim: false };
    case "encerrando":
      return { src: assets.encerrando.video, loop: false, avisaFim: true };
  }
}

export default function Sala1TvPage() {
  const [estado, setEstado] = useState<Estado>({ tipo: "standby" });
  const [audioBloqueado, setAudioBloqueado] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("sala1:entrar", { papel: "tv" });
    socket.on("sala1:estado", setEstado);
    return () => {
      socket.off("sala1:estado", setEstado);
    };
  }, []);

  const { src, loop, avisaFim } = videoDoEstado(estado);

  useEffect(() => {
    videoRef.current
      ?.play()
      .then(() => setAudioBloqueado(false))
      .catch(() => setAudioBloqueado(true));
  }, [src]);

  function habilitarAudio() {
    videoRef.current
      ?.play()
      .then(() => setAudioBloqueado(false))
      .catch(() => {});
  }

  return (
    <main className="relative h-screen w-screen bg-black">
      <video
        ref={videoRef}
        key={src}
        src={src}
        autoPlay
        muted={loop}
        loop={loop}
        onEnded={() => avisaFim && getSocket().emit("sala1:video-finalizado")}
        className="h-full w-full object-cover"
      />
      {audioBloqueado && (
        <button
          onClick={habilitarAudio}
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl text-white"
        >
          Toque para habilitar o som
        </button>
      )}
    </main>
  );
}
