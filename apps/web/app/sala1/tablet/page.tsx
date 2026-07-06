"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import { temas, type TemaId } from "@/lib/temas";

type Estado = "selecionando" | "aguardando-video";

export default function Sala1TabletPage() {
  const [estado, setEstado] = useState<Estado>("selecionando");

  useEffect(() => {
    const socket = getSocket();
    socket.emit("sala1:entrar", { papel: "tablet" });

    socket.on("sala1:voltar-loop", () => setEstado("selecionando"));

    return () => {
      socket.off("sala1:voltar-loop");
    };
  }, []);

  function selecionarTema(temaId: TemaId) {
    setEstado("aguardando-video");
    getSocket().emit("sala1:selecionar-tema", { temaId });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-neutral-950 p-10 text-center text-white">
      <div>
        <h1 className="text-4xl font-bold">Bem-vindo ao Museu do Sertão de Piranhas</h1>
        <p className="mt-4 text-2xl text-neutral-300">
          {estado === "selecionando"
            ? "Selecione o tema que deseja se aprofundar"
            : "Assista à projeção na tela ao lado"}
        </p>
      </div>

      {estado === "selecionando" && (
        <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
          {temas.map((tema) => (
            <button
              key={tema.id}
              onClick={() => selecionarTema(tema.id)}
              className="rounded-2xl bg-neutral-800 px-8 py-12 text-3xl font-semibold transition active:scale-95 active:bg-neutral-700"
            >
              {tema.titulo}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
