import { DIFICULDADES, type Dificuldade } from "@/lib/sala6/dificuldades";

export interface Peca {
  /** Posição na grade. Estável durante a partida — é a identidade da peça. */
  indice: number;
  cartaId: string;
}

export interface EstadoJogo {
  dificuldade: Dificuldade;
  pecas: Peca[];
  /** Índices virados aguardando comparação. Nunca passa de dois. */
  viradas: number[];
  /** Índices de pares já encontrados, que ficam virados até o fim. */
  encontradas: number[];
}

function embaralhar<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function novoJogo(dificuldade: Dificuldade): EstadoJogo {
  const { cartas, grade } = DIFICULDADES[dificuldade];
  const pares = (grade.colunas * grade.linhas) / 2;

  if (cartas.length < pares) {
    throw new Error(
      `Nível ${dificuldade}: a grade pede ${pares} pares e só há ${cartas.length} cartas.`
    );
  }

  const sorteadas = embaralhar(cartas).slice(0, pares);
  const baralho = embaralhar([...sorteadas, ...sorteadas]);

  return {
    dificuldade,
    pecas: baralho.map((cartaId, indice) => ({ indice, cartaId })),
    viradas: [],
    encontradas: [],
  };
}

export function estaVirada(estado: EstadoJogo, indice: number): boolean {
  return estado.viradas.includes(indice) || estado.encontradas.includes(indice);
}

export function venceu(estado: EstadoJogo): boolean {
  return estado.encontradas.length === estado.pecas.length;
}

/**
 * Aplica um toque numa peça.
 *
 * Devolve o estado seguinte e se o par bateu. Ignora o toque quando já há duas
 * cartas viradas — nesse instante a partida está no intervalo em que o jogador
 * está vendo o par errado, e aceitar um terceiro toque aqui deixaria uma carta
 * virada para sempre.
 */
export function virar(estado: EstadoJogo, indice: number): { estado: EstadoJogo; acertou: boolean } {
  if (estado.viradas.length >= 2 || estaVirada(estado, indice)) {
    return { estado, acertou: false };
  }

  const viradas = [...estado.viradas, indice];
  if (viradas.length < 2) return { estado: { ...estado, viradas }, acertou: false };

  const [a, b] = viradas;
  const acertou = estado.pecas[a].cartaId === estado.pecas[b].cartaId;

  if (!acertou) return { estado: { ...estado, viradas }, acertou: false };

  return {
    estado: { ...estado, viradas: [], encontradas: [...estado.encontradas, a, b] },
    acertou: true,
  };
}

/** Desvira o par errado. Chamado depois do intervalo em que o jogador vê as duas. */
export function desvirar(estado: EstadoJogo): EstadoJogo {
  return { ...estado, viradas: [] };
}

/** Formata segundos como MM:SS, que é como o protótipo mostra tempo em toda parte. */
export function formatarTempo(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Quanto tempo o par errado fica visível antes de desvirar. */
export const MS_MOSTRANDO_ERRO = 900;
