import type { Dificuldade } from "@/lib/sala6/dificuldades";

/**
 * DTO de saída: uma colocação como a Sala 6 a exibe.
 *
 * Não é a entidade. `pontuacoesSala6` também guarda `dificuldade` e `criadoEm`,
 * que ficam de fora de propósito: a dificuldade já é a chave da coluna em que a
 * linha aparece, e a data só serve para desempatar do lado do servidor. Mandar
 * os dois seria vazar detalhe de armazenamento para a tela.
 */
export interface LinhaRanking {
  id: string;
  jogador: string;
  segundos: number;
}

/** DTO de saída: o placar inteiro, uma coluna por dificuldade. */
export type Ranking = Record<Dificuldade, LinhaRanking[]>;

/** DTO de entrada: o corpo aceito no POST e no PUT. */
export interface EntradaRanking {
  jogador: string;
  dificuldade: Dificuldade;
  segundos: number;
}
