"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";
import { jaPrestigiou, marcarPrestigiado } from "@/lib/sala7/prestigios";
import { Logo } from "@/components/escada/Logo";
import { CardDepoimento } from "@/components/sala7/CardDepoimento";
import { PainelFiltro, type FiltroTipo, type Ordenacao } from "@/components/sala7/PainelFiltro";
import { TelaDetalhe } from "@/components/sala7/TelaDetalhe";

export default function Sala7Page() {
  const [depoimentos, setDepoimentos] = useState<DepoimentoPublico[]>([]);
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [, forcarAtualizacao] = useState(0);

  useEffect(() => {
    fetch("/api/depoimentos")
      .then((r) => r.json())
      .then(setDepoimentos);

    const socket = getSocket();
    socket.emit("sala7:entrar");

    const aoReceberNovo = (novo: DepoimentoPublico) => setDepoimentos((atual) => [novo, ...atual]);
    const aoRemover = ({ id }: { id: string }) => setDepoimentos((atual) => atual.filter((d) => d.id !== id));
    const aoAtualizarPrestigio = ({ id, prestigios }: { id: string; prestigios: number }) =>
      setDepoimentos((atual) => atual.map((d) => (d.id === id ? { ...d, prestigios } : d)));

    socket.on("sala7:novo-depoimento", aoReceberNovo);
    socket.on("sala7:depoimento-removido", aoRemover);
    socket.on("sala7:prestigio-atualizado", aoAtualizarPrestigio);

    return () => {
      socket.off("sala7:novo-depoimento", aoReceberNovo);
      socket.off("sala7:depoimento-removido", aoRemover);
      socket.off("sala7:prestigio-atualizado", aoAtualizarPrestigio);
    };
  }, []);

  const lista = useMemo(() => {
    let resultado = depoimentos;
    if (tipo !== "todos") resultado = resultado.filter((d) => d.tipo === tipo);
    resultado = [...resultado].sort((a, b) =>
      ordenacao === "prestigiados"
        ? b.prestigios - a.prestigios
        : new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    );
    return resultado;
  }, [depoimentos, tipo, ordenacao]);

  const estados = new Set(depoimentos.map((d) => d.estado)).size;
  const paises = new Set(depoimentos.map((d) => d.pais)).size;

  const indiceSelecionado = lista.findIndex((d) => d.id === selecionadoId);
  const selecionado = indiceSelecionado >= 0 ? lista[indiceSelecionado] : null;

  async function prestigiar(id: string) {
    if (jaPrestigiou(id)) return;
    await fetch(`/api/depoimentos/${id}/prestigiar`, { method: "POST" });
    marcarPrestigiado(id);
    forcarAtualizacao((n) => n + 1);
  }

  if (selecionado) {
    return (
      <TelaDetalhe
        depoimento={selecionado}
        jaPrestigiou={jaPrestigiou(selecionado.id)}
        onVoltar={() => setSelecionadoId(null)}
        onAnterior={() => setSelecionadoId(lista[(indiceSelecionado - 1 + lista.length) % lista.length].id)}
        onProximo={() => setSelecionadoId(lista[(indiceSelecionado + 1) % lista.length].id)}
        onPrestigiar={() => prestigiar(selecionado.id)}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full p-8 sm:p-12" style={{ backgroundColor: coresSala7.fundo }}>
      <div className="mb-10 flex items-start justify-between gap-8">
        <div className="max-w-xs rounded-md p-5" style={{ backgroundColor: coresSala7.painelFiltro }}>
          <p className="font-bold text-white">Quer aparecer nesta galeria?</p>
          <p className="mt-2 text-sm text-white/90">
            Vá até a cabine de gravação, localizada na escada do térreo, e registre sua visita com uma foto ou um
            vídeo.
          </p>
        </div>

        <div className="flex-1 text-center">
          <h1 className="text-3xl font-extrabold tracking-wide" style={{ color: coresSala7.texto }}>
            GALERIA DE DEPOIMENTOS
          </h1>
          <p className="mt-2" style={{ color: coresSala7.texto }}>
            O Museu do Sertão já recebeu <strong>{depoimentos.length}</strong> visitantes de <strong>{estados}</strong>{" "}
            estados e <strong>{paises}</strong> países.
          </p>
        </div>

        <Logo variante="escura" />
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {lista.map((d) => (
          <CardDepoimento key={d.id} depoimento={d} onClick={() => setSelecionadoId(d.id)} />
        ))}
        {lista.length === 0 && <p style={{ color: coresSala7.texto }}>Nenhum depoimento ainda.</p>}
      </div>

      <div className="absolute right-8 top-32 sm:right-12">
        <PainelFiltro tipo={tipo} ordenacao={ordenacao} onTipoChange={setTipo} onOrdenacaoChange={setOrdenacao} />
      </div>
    </div>
  );
}
