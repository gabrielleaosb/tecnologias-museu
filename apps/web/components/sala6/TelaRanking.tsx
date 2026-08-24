"use client";

import { coresSala6 } from "@/lib/sala6/cores";
import { d, PESO, TRACKING } from "@/lib/sala6/medidas";
import { DIFICULDADES, ORDEM_DIFICULDADES, type Dificuldade } from "@/lib/sala6/dificuldades";
import { formatarTempo } from "@/lib/sala6/jogo";
import type { LinhaRanking, Ranking } from "@/app/api/sala6/ranking/route";
import { Casa } from "@/components/sala6/Casa";
import { LogoSala6 } from "@/components/sala6/LogoSala6";

interface TelaRankingProps {
  ranking: Ranking | null;
  /** Pontuação recém-gravada, destacada para o jogador se achar na lista. */
  destaque?: string;
  onSair: () => void;
}

const coluna = {
  largura: 766,
  altura: 707,
  y: 254,
  /** Origem X de cada coluna: fácil à esquerda, difícil à direita. */
  x: { facil: 172, dificil: 982 },
  /** Recuo interno até o nome, medido do PDF (289 − 172). */
  recuo: 117,
  titulo: { y: 321, texto: 35.8 },
  linha: { primeira: 414, passo: 80.3, texto: 27.9, alturaTexto: 34 },
  /** Distância da origem da coluna até a coluna do tempo (701 − 172). */
  tempo: 529,
  /** A coroa fica à esquerda do nome, recuada 45 da borda da coluna (217 − 172). */
  coroa: { largura: 49, altura: 34, x: 45 },
} as const;

/**
 * Topo da lista dentro da coluna. Cada item tem a altura do passo entre linhas e
 * centraliza o texto, então o topo da lista é o topo da primeira linha do PDF menos
 * a folga que a centralização acrescenta acima do texto.
 */
const TOPO_LISTA =
  coluna.linha.primeira - coluna.y - (coluna.linha.passo - coluna.linha.alturaTexto) / 2;

const fundoColuna: Record<Dificuldade, string> = {
  facil: coresSala6.begeMedio,
  dificil: coresSala6.marromMedio,
};

const tintaColuna: Record<Dificuldade, string> = {
  facil: coresSala6.marrom,
  dificil: coresSala6.branco,
};

/** Página 11 do PDF. */
export function TelaRanking({ ranking, destaque, onSair }: TelaRankingProps) {
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: coresSala6.bege }}>
      <Casa variante="sairMarrom" x={73} y={61} onClick={onSair} rotuloAcessivel="Sair" />

      {/*
        No PDF esta logo é a variante horizontal, que não veio junto com os assets.
        Fica a vertical, alinhada pela mesma borda direita, até a horizontal chegar.
      */}
      <LogoSala6 variante="marrom" x={1680} y={40} largura={111} opacidade={0.45} />

      <h1
        className="absolute w-full text-center"
        style={{
          top: d(58),
          color: coresSala6.rotulo,
          fontSize: d(55.9),
          fontWeight: PESO.bold,
          letterSpacing: TRACKING.largo,
          textIndent: TRACKING.largo,
          lineHeight: 1.23,
        }}
      >
        JOGO DA MEMÓRIA
      </h1>
      <p
        className="absolute w-full text-center"
        style={{
          top: d(143),
          color: coresSala6.rotulo,
          fontSize: d(23.9),
          fontWeight: PESO.demi,
          letterSpacing: TRACKING.extra,
          textIndent: TRACKING.extra,
          lineHeight: 1.21,
        }}
      >
        RANKING GERAL
      </p>

      {ORDEM_DIFICULDADES.map((dificuldade) => (
        <ColunaRanking
          key={dificuldade}
          dificuldade={dificuldade}
          linhas={ranking?.[dificuldade] ?? null}
          destaque={destaque}
        />
      ))}
    </div>
  );
}

function ColunaRanking({
  dificuldade,
  linhas,
  destaque,
}: {
  dificuldade: Dificuldade;
  linhas: LinhaRanking[] | null;
  destaque?: string;
}) {
  const x = coluna.x[dificuldade];
  const tinta = tintaColuna[dificuldade];

  return (
    <div
      className="absolute"
      style={{
        left: d(x),
        top: d(coluna.y),
        width: d(coluna.largura),
        height: d(coluna.altura),
        backgroundColor: fundoColuna[dificuldade],
      }}
    >
      <p
        className="absolute"
        style={{
          left: d(coluna.recuo),
          top: d(coluna.titulo.y - coluna.y),
          color: tinta,
          fontSize: d(coluna.titulo.texto),
          fontWeight: PESO.extraBold,
          letterSpacing: TRACKING.largo,
          lineHeight: 1.23,
        }}
      >
        {DIFICULDADES[dificuldade].rotuloRanking}
      </p>

      {/*
        A lista é ancorada na coluna da coroa, e não na do nome, porque `overflow-y`
        recorta também na horizontal: com a lista começando no nome, a coroa ficaria
        num deslocamento negativo e seria cortada. O nome recebe o recuo por dentro.
      */}
      <ol
        className="absolute overflow-y-auto"
        style={{
          left: d(coluna.coroa.x),
          top: d(TOPO_LISTA),
          // Termina com o mesmo respiro que separa a lista da borda de baixo.
          width: d(coluna.largura - coluna.coroa.x - 45),
          height: d(coluna.altura - TOPO_LISTA - 45),
          scrollbarWidth: "thin",
          scrollbarColor: `${tinta} transparent`,
        }}
      >
        {linhas === null && <Aviso tinta={tinta}>Carregando…</Aviso>}
        {linhas?.length === 0 && <Aviso tinta={tinta}>Ninguém pontuou ainda.</Aviso>}

        {linhas?.map((linha, i) => (
          <li
            key={linha.id}
            className="relative flex items-center"
            style={{
              height: d(coluna.linha.passo),
              paddingLeft: d(coluna.recuo - coluna.coroa.x),
              color: tinta,
              fontSize: d(coluna.linha.texto),
              fontWeight: PESO.heavy,
              letterSpacing: TRACKING.largo,
              // A pontuação recém-gravada acende para o jogador se localizar na lista.
              opacity: destaque && linha.id !== destaque ? 0.65 : 1,
            }}
          >
            {i === 0 && <Coroa />}
            <span className="truncate" style={{ width: d(coluna.tempo - coluna.recuo) }}>
              {linha.jogador}
            </span>
            <span>{formatarTempo(linha.segundos)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Aviso({ tinta, children }: { tinta: string; children: string }) {
  return (
    <li
      style={{
        color: tinta,
        fontSize: d(coluna.linha.texto),
        fontWeight: PESO.demi,
        letterSpacing: TRACKING.normal,
        opacity: 0.7,
      }}
    >
      {children}
    </li>
  );
}

/** Coroa do primeiro colocado. Não veio como asset, então é desenhada aqui. */
function Coroa() {
  return (
    <svg
      viewBox="0 0 49 34"
      aria-label="Primeiro lugar"
      className="absolute"
      style={{
        // A lista já começa na coluna da coroa, então ela fica na borda do item.
        left: 0,
        width: d(coluna.coroa.largura),
        height: d(coluna.coroa.altura),
        fill: coresSala6.coroa,
      }}
    >
      <path d="M2 33 L0 6 L12 15 L24.5 0 L37 15 L49 6 L47 33 Z" />
    </svg>
  );
}
