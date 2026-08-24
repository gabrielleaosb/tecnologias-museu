"use client";

import Image from "next/image";
import { coresSala6 } from "@/lib/sala6/cores";
import { d, medidasSala6, PESO, TRACKING } from "@/lib/sala6/medidas";
import { DIFICULDADES } from "@/lib/sala6/dificuldades";
import { carta } from "@/lib/sala6/cartas";
import { estaVirada, formatarTempo, type EstadoJogo } from "@/lib/sala6/jogo";
import { Casa } from "@/components/sala6/Casa";

const { cabecalhoJogo } = medidasSala6;

interface TabuleiroProps {
  estado: EstadoJogo;
  segundosRestantes: number;
  onVirar: (indice: number) => void;
  onSair: () => void;
}

/** Páginas 3/4 (fácil) e 7/8 (difícil) do PDF — a mesma tela em duas paletas. */
export function Tabuleiro({ estado, segundosRestantes, onVirar, onSair }: TabuleiroProps) {
  const config = DIFICULDADES[estado.dificuldade];
  const { grade } = config;

  // A grade é centralizada na horizontal e ancorada no topo definido pelo PDF.
  const largura = grade.colunas * grade.carta + (grade.colunas - 1) * (grade.passoX - grade.carta);

  return (
    <div className="relative h-full w-full" style={{ backgroundColor: config.mesa }}>
      <Casa
        variante={estado.dificuldade === "facil" ? "sairMarrom" : "sairBranco"}
        x={cabecalhoJogo.casa.x}
        y={cabecalhoJogo.casa.y}
        onClick={onSair}
        rotuloAcessivel="Sair"
      />

      <h1
        className="absolute w-full text-center"
        style={{
          top: d(cabecalhoJogo.titulo.y),
          color: config.tinta,
          fontSize: d(cabecalhoJogo.titulo.texto),
          fontWeight: PESO.extraBold,
          letterSpacing: TRACKING.largo,
          textIndent: TRACKING.largo,
          lineHeight: 1.23,
        }}
      >
        {config.rotulo}
      </h1>

      <div
        className="absolute flex items-center"
        style={{ left: d(cabecalhoJogo.relogio.x), top: d(cabecalhoJogo.relogio.y) }}
      >
        <Image
          src={config.iconeRelogio}
          alt=""
          width={127}
          height={127}
          style={{
            width: d(cabecalhoJogo.relogio.tamanho),
            height: d(cabecalhoJogo.relogio.tamanho),
          }}
        />
        <span
          style={{
            marginLeft: d(cabecalhoJogo.relogio.espaco),
            color: config.tinta,
            fontSize: d(cabecalhoJogo.relogio.texto),
            fontWeight: PESO.heavy,
            letterSpacing: TRACKING.largo,
            lineHeight: 1,
          }}
        >
          {formatarTempo(segundosRestantes)}
        </span>
      </div>

      <div
        className="absolute grid"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          top: d(grade.topo),
          width: d(largura),
          gridTemplateColumns: `repeat(${grade.colunas}, ${d(grade.carta)})`,
          columnGap: d(grade.passoX - grade.carta),
          rowGap: d(grade.passoY - grade.carta),
        }}
      >
        {estado.pecas.map((peca) => {
          const virada = estaVirada(estado, peca.indice);
          const face = carta(peca.cartaId);

          return (
            <button
              key={peca.indice}
              onClick={() => onVirar(peca.indice)}
              disabled={virada}
              aria-label={virada ? face.nome : "Carta virada para baixo"}
              className="relative cursor-pointer"
              style={{ width: d(grade.carta), height: d(grade.carta) }}
            >
              {/*
                As duas faces ficam montadas o tempo todo e alternam por opacidade.
                Trocar o `src` faria o navegador buscar a imagem só no momento do
                toque, e a carta piscaria em branco na primeira vez que fosse virada.
              */}
              <Image
                src={config.verso}
                alt=""
                width={457}
                height={457}
                priority
                className="absolute inset-0 h-full w-full"
                style={{ opacity: virada ? 0 : 1, transition: "opacity 180ms" }}
              />
              <Image
                src={face.imagem}
                alt=""
                width={grade.carta * 2}
                height={grade.carta * 2}
                className="absolute inset-0 h-full w-full"
                style={{
                  opacity: virada ? 1 : 0,
                  transition: "opacity 180ms",
                  backgroundColor: coresSala6.branco,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
