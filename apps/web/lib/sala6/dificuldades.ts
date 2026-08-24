import { CARTAS_DIFICIL, CARTAS_FACIL } from "@/lib/sala6/cartas";
import { coresSala6 } from "@/lib/sala6/cores";
import { medidasSala6, type Grade } from "@/lib/sala6/medidas";

export type Dificuldade = "facil" | "dificil";

export interface ConfigDificuldade {
  id: Dificuldade;
  /** Como aparece no cabeçalho do tabuleiro e no seletor. */
  rotulo: string;
  /** Como aparece no topo da coluna do ranking. */
  rotuloRanking: string;
  cartas: string[];
  grade: Grade;
  /** Duração da partida, em segundos. Zerou, perdeu. */
  segundos: number;
  /** A paleta inverte entre os dois níveis: o difícil é a versão escura da tela. */
  mesa: string;
  verso: string;
  tinta: string;
  iconeCasa: string;
  iconeRelogio: string;
}

export const DIFICULDADES: Record<Dificuldade, ConfigDificuldade> = {
  facil: {
    id: "facil",
    rotulo: "FÁCIL",
    rotuloRanking: "MODO FÁCIL",
    cartas: CARTAS_FACIL,
    grade: medidasSala6.tabuleiro.facil,
    segundos: 120,
    mesa: coresSala6.begeMedio,
    verso: "/icons/sala6/peca-facil.png",
    tinta: coresSala6.marrom,
    iconeCasa: "/icons/sala6/sair-marrom.png",
    iconeRelogio: "/icons/sala6/temporizador-marrom.png",
  },
  dificil: {
    id: "dificil",
    rotulo: "DIFÍCIL",
    rotuloRanking: "MODO DIFÍCIL",
    cartas: CARTAS_DIFICIL,
    grade: medidasSala6.tabuleiro.dificil,
    segundos: 180,
    mesa: coresSala6.marromMedio,
    verso: "/icons/sala6/peca-dificil.png",
    tinta: coresSala6.branco,
    iconeCasa: "/icons/sala6/sair-branco.png",
    iconeRelogio: "/icons/sala6/temporizador-branco.png",
  },
};

export const ORDEM_DIFICULDADES: Dificuldade[] = ["facil", "dificil"];

export function ehDificuldade(v: unknown): v is Dificuldade {
  return v === "facil" || v === "dificil";
}
