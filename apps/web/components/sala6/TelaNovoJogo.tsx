"use client";

import { useEffect, useRef } from "react";
import { coresSala6 } from "@/lib/sala6/cores";
import { d, PESO, TRACKING } from "@/lib/sala6/medidas";
import { DIFICULDADES, ORDEM_DIFICULDADES, type Dificuldade } from "@/lib/sala6/dificuldades";
import { Casa } from "@/components/sala6/Casa";
import { LogoSala6 } from "@/components/sala6/LogoSala6";
import { TecladoVirtual } from "@/components/TecladoVirtual";

interface TelaNovoJogoProps {
  nome: string;
  onNomeChange: (v: string) => void;
  dificuldade: Dificuldade;
  onDificuldadeChange: (v: Dificuldade) => void;
  onIniciar: () => void;
  onSair: () => void;
}

/** Teto do nome, alinhado ao que a API aceita. */
const MAX_NOME = 24;

const campo = {
  esquerda: 727,
  largura: 465,
  altura: 84,
  /** No PDF o texto começa 64px depois da borda do campo. */
  recuo: 64,
} as const;

/** Painel bege central. Também delimita os rótulos, que antes iam de ponta a ponta. */
const painel = { esquerda: 596, largura: 728 } as const;

/** Página 2 do PDF. */
export function TelaNovoJogo({
  nome,
  onNomeChange,
  dificuldade,
  onDificuldadeChange,
  onIniciar,
  onSair,
}: TelaNovoJogoProps) {
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    entrada.current?.focus();
  }, []);

  function alternarDificuldade() {
    const i = ORDEM_DIFICULDADES.indexOf(dificuldade);
    onDificuldadeChange(ORDEM_DIFICULDADES[(i + 1) % ORDEM_DIFICULDADES.length]);
  }

  const estiloCampo = {
    position: "absolute",
    left: d(campo.esquerda),
    width: d(campo.largura),
    height: d(campo.altura),
    backgroundColor: coresSala6.campo,
    // Metade da altura: no PDF as pontas do campo são semicírculos.
    borderRadius: d(campo.altura / 2),
    paddingLeft: d(campo.recuo),
    color: coresSala6.marrom,
    fontSize: d(31.1),
    fontWeight: PESO.heavy,
    letterSpacing: TRACKING.largo,
  } as const;

  const estiloRotulo = {
    position: "absolute",
    /**
     * Limitado ao painel, e não à largura da tela.
     *
     * Com `width: 100%` o rótulo virava uma faixa invisível de ponta a ponta: cobria
     * a parte de baixo do botão SAIR, que deixava de responder ali, e ainda fazia um
     * toque em qualquer lugar daquela altura focar o campo de nome.
     */
    left: d(painel.esquerda),
    width: d(painel.largura),
    color: coresSala6.rotulo,
    fontSize: d(31.1),
    fontWeight: PESO.demi,
    letterSpacing: TRACKING.largo,
    textIndent: TRACKING.largo,
    textAlign: "center",
  } as const;

  return (
    <div className="relative h-full w-full" style={{ backgroundColor: coresSala6.ocre }}>
      <Casa variante="sairMarrom" x={66} y={66} onClick={onSair} rotuloAcessivel="Sair" />

      {/* Marca lateral esquerda e logo à direita, ambas rebaixadas sobre o ocre. */}
      <div
        className="absolute"
        style={{ left: d(105), top: d(365), opacity: coresSala6.marcaDagua }}
      >
        <p
          style={{
            color: coresSala6.marrom,
            fontSize: d(62.3),
            fontWeight: PESO.bold,
            letterSpacing: TRACKING.largo,
            lineHeight: 1.08,
          }}
        >
          JOGO DA
          <br />
          MEMÓRIA
        </p>
        <p
          style={{
            marginTop: d(25),
            color: coresSala6.marrom,
            fontSize: d(23.6),
            fontWeight: PESO.demi,
            letterSpacing: TRACKING.extra,
            lineHeight: 1.57,
          }}
        >
          PALEONTOLOGIA
          <br />
          E BIOMA
        </p>
      </div>

      <LogoSala6
        variante="marrom"
        x={1506}
        y={284}
        largura={283}
        opacidade={coresSala6.marcaDagua}
      />

      {/*
        Painel central. No PDF ele para em y=930 para abrir espaço ao teclado do
        sistema, mas aqui desce até o rodapé: o teclado é sobreposto, e o painel
        interrompido deixava uma faixa de fundo solta embaixo. Só a altura muda —
        todo o conteúdo é posicionado em relação à página, não ao painel, então
        nada se desloca.
      */}
      <div
        className="absolute"
        style={{
          left: d(painel.esquerda),
          top: 0,
          width: d(painel.largura),
          height: "100%",
          backgroundColor: coresSala6.bege,
        }}
      />

      <h1
        className="pointer-events-none absolute w-full text-center"
        style={{
          top: d(71),
          color: coresSala6.marrom,
          fontSize: d(52.1),
          fontWeight: PESO.extraBold,
          letterSpacing: TRACKING.largo,
          textIndent: TRACKING.largo,
          lineHeight: 1.23,
        }}
      >
        NOVO JOGO
      </h1>

      <label htmlFor="sala6-nome" style={{ ...estiloRotulo, top: d(196) }}>
        NOME DE JOGADOR
      </label>
      <input
        id="sala6-nome"
        ref={entrada}
        value={nome}
        onChange={(e) => onNomeChange(e.target.value.toUpperCase().slice(0, MAX_NOME))}
        onKeyDown={(e) => e.key === "Enter" && nome.trim() && onIniciar()}
        maxLength={MAX_NOME}
        autoComplete="off"
        // Impede o teclado do sistema de abrir por cima do teclado do app. O campo
        // segue focável e editável — só não pede o teclado nativo.
        inputMode="none"
        className="outline-none"
        style={{ ...estiloCampo, top: d(256) }}
      />

      <span style={{ ...estiloRotulo, top: d(395) }}>NÍVEL</span>
      <button
        onClick={alternarDificuldade}
        className="flex cursor-pointer items-center justify-between"
        style={{ ...estiloCampo, top: d(455), paddingRight: d(50) }}
      >
        <span>{DIFICULDADES[dificuldade].rotulo}</span>
        {/* O chevron do PDF é um "v" apontando para baixo, na cor do texto. */}
        <svg
          viewBox="0 0 24 14"
          aria-hidden
          style={{ width: d(55), height: d(32), fill: "none", strokeWidth: 2.5 }}
          stroke={coresSala6.marrom}
        >
          <path d="M2 2 L12 12 L22 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={onIniciar}
        disabled={!nome.trim()}
        className="absolute cursor-pointer disabled:opacity-40"
        style={{
          left: d(790),
          top: d(595),
          width: d(341),
          height: d(86),
          backgroundColor: coresSala6.marrom,
          color: coresSala6.bege,
          fontSize: d(32.4),
          fontWeight: PESO.extraBold,
          letterSpacing: TRACKING.largo,
          textIndent: TRACKING.largo,
        }}
      >
        INICIAR
      </button>

      {/*
        Ancorado no container: o canvas 16:9 é centralizado na tela do totem, e um
        teclado preso à janela sairia do lugar assim que houvesse letterbox.

        A geometria é a mesma da Escada e vem do próprio componente. Ela foi calibrada
        por esta tela, que é a mais restrita: entre o fim do INICIAR (y=681) e o rodapé
        sobram 399, e o teclado precisa caber ali **na altura máxima** — cinco fileiras,
        com os acentos abertos. No PDF o teclado do Windows encosta no botão, mas ali é
        só desenho; aqui encobrir o INICIAR o tornaria intocável, já que não existe
        tecla Enter para substituí-lo, e a fileira de acentos só fecha por vontade de
        quem abriu. Mexer na escala do teclado exige refazer esta conta.
      */}
      <TecladoVirtual ancoragem="container" />
    </div>
  );
}
