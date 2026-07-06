"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import { HotspotImage } from "@/components/HotspotImage";
import { assets, buscarTema, type TemaId } from "@/lib/sala1/temas";
import { hotspotsStandby, hotspotsMenu, hotspotsTema, hotspotsFimVideo, hotspotsEncerrando } from "@/lib/sala1/hotspots";
import type { Estado } from "@/lib/sala1/estado";

export default function Sala1TabletPage() {
  const [estado, setEstado] = useState<Estado>({ tipo: "standby" });

  useEffect(() => {
    const socket = getSocket();
    socket.emit("sala1:entrar", { papel: "tablet" });
    socket.on("sala1:estado", setEstado);
    return () => {
      socket.off("sala1:estado", setEstado);
    };
  }, []);

  switch (estado.tipo) {
    case "standby":
      return (
        <HotspotImage
          src={assets.standby.imagem}
          alt="Tela inicial"
          hotspots={hotspotsStandby}
          onHotspot={() => getSocket().emit("sala1:iniciar")}
        />
      );

    case "menu":
      return (
        <HotspotImage
          src={assets.menu.imagem}
          alt="Escolha o tema"
          hotspots={hotspotsMenu}
          onHotspot={(id) => getSocket().emit("sala1:selecionar-tema", { temaId: id as TemaId })}
        />
      );

    case "tema":
      return (
        <HotspotImage
          src={buscarTema(estado.temaId).imagem}
          alt={buscarTema(estado.temaId).titulo}
          hotspots={hotspotsTema}
          onHotspot={() => getSocket().emit("sala1:sair")}
        />
      );

    case "fim-video":
      return (
        <HotspotImage
          src={assets.fimVideo.imagem}
          alt="Quer escolher outro tema?"
          hotspots={hotspotsFimVideo}
          onHotspot={(id) => {
            if (id === "sim") getSocket().emit("sala1:outro-sim");
            if (id === "nao") getSocket().emit("sala1:outro-nao");
          }}
        />
      );

    case "encerrando":
      return (
        <HotspotImage src={assets.encerrando.imagem} alt="Encerrando" hotspots={hotspotsEncerrando} onHotspot={() => {}} />
      );
  }
}
