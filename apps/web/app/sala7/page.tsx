"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket/client";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";
import { galeria, g, PESO } from "@/lib/sala7/medidas";
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

  const { convite, titulo, subtitulo, logo, filtro, grade } = galeria;

  /** Destaca em Heavy os números da frase, como no protótipo. */
  const numero = (valor: number) => (
    <strong style={{ fontWeight: PESO.heavy }}>{valor}</strong>
  );

  return (
    <div
      className="relative min-h-screen w-full"
      style={{ backgroundColor: coresSala7.fundo, paddingBottom: g(grade.margem) }}
    >
      {/*
        O cabeçalho é posicionado por coordenada, e não empilhado em fluxo: a cartela
        de convite, o título e a logo têm alturas independentes e no protótipo não se
        alinham por nenhuma borda comum. A grade começa depois, num `paddingTop` fixo.
      */}
      <div
        className="absolute"
        style={{
          left: g(convite.x),
          top: g(convite.y),
          width: g(convite.largura),
          height: g(convite.altura),
          backgroundColor: coresSala7.painel,
          borderRadius: g(convite.raio),
        }}
      />
      <div
        className="absolute text-left"
        style={{
          left: g(convite.texto.x),
          top: g(convite.texto.y),
          width: g(convite.texto.largura),
          height: g(convite.texto.altura),
          color: coresSala7.textoClaro,
          fontSize: g(convite.texto.corpo),
          letterSpacing: g(convite.texto.tracking),
          lineHeight: `${convite.texto.entrelinha / convite.texto.corpo}`,
        }}
      >
        <p style={{ fontWeight: PESO.bold }}>Quer aparecer nesta galeria?</p>
        {/* O protótipo abre uma linha em branco entre a pergunta e a explicação. */}
        <p style={{ marginTop: g(convite.texto.entrelinha), fontWeight: PESO.medium }}>
          Vá até a cabine de gravação, localizada na escada do térreo, e registre sua visita com uma foto ou um vídeo.
        </p>
      </div>

      <div className="absolute inset-x-0 text-center" style={{ top: g(titulo.y) }}>
        <h1
          className="uppercase"
          style={{
            color: coresSala7.texto,
            fontSize: g(titulo.texto),
            fontWeight: PESO.heavy,
            lineHeight: 1,
          }}
        >
          {/*
            A entreletra do CSS entra também **depois** do último caractere, e essa
            sobra invisível conta na hora de centralizar — o texto sairia meia
            entreletra à esquerda do centro. Aplicá-la num `inline-block` com margem
            negativa de mesmo valor tira a sobra da largura, e aí o centro do bloco
            volta a ser o centro do que se vê.
          */}
          <span
            className="inline-block"
            style={{ letterSpacing: g(titulo.tracking), marginRight: g(-titulo.tracking) }}
          >
            Galeria de
          </span>
        </h1>
        <p
          className="mx-auto"
          style={{
            marginTop: g(subtitulo.y - titulo.y - titulo.texto),
            maxWidth: g(subtitulo.largura),
            color: coresSala7.textoSuave,
            fontSize: g(subtitulo.texto),
            fontWeight: PESO.medium,
            letterSpacing: g(subtitulo.tracking),
            lineHeight: `${subtitulo.entrelinha / subtitulo.texto}`,
          }}
        >
          O Museu do Sertão já recebeu {numero(depoimentos.length)} visitantes de {numero(estados)} estados e{" "}
          {numero(paises)} países.
        </p>
      </div>

      <Logo
        variante="escura2-vertical"
        style={{ position: "absolute", left: g(logo.x), top: g(logo.y), width: g(logo.largura) }}
      />

      {/* Flutua sobre a quarta coluna — por isso vem depois da grade na pilha. */}
      <div className="absolute z-10" style={{ left: g(filtro.x), top: g(filtro.y) }}>
        <PainelFiltro tipo={tipo} ordenacao={ordenacao} onTipoChange={setTipo} onOrdenacaoChange={setOrdenacao} />
      </div>

      <div
        className="grid"
        style={{
          paddingTop: g(grade.topo),
          paddingLeft: g(grade.margem),
          paddingRight: g(grade.margem),
          gridTemplateColumns: `repeat(${grade.colunas}, 1fr)`,
          gap: g(grade.calha),
        }}
      >
        {lista.map((depoimento) => (
          <CardDepoimento
            key={depoimento.id}
            depoimento={depoimento}
            onClick={() => setSelecionadoId(depoimento.id)}
          />
        ))}
      </div>

      {lista.length === 0 && (
        <p
          className="text-center"
          style={{ paddingTop: g(80), color: coresSala7.textoSuave, fontSize: g(subtitulo.texto) }}
        >
          Nenhum depoimento ainda.
        </p>
      )}
    </div>
  );
}
