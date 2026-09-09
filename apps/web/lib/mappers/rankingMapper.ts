import type { NovaPontuacaoSala6, PontuacaoSala6 } from "@/lib/db/schema";
import type { EntradaRanking, LinhaRanking } from "@/lib/dtos/rankingDto";
import { ehDificuldade } from "@/lib/sala6/dificuldades";
import { DadosInvalidos } from "@/lib/erros/dominio";

const MAX_NOME = 24;

/** Entidade → DTO de saída. Descarta `dificuldade` e `criadoEm`. */
export function paraLinhaRanking(pontuacao: PontuacaoSala6): LinhaRanking {
  return {
    id: pontuacao.id,
    jogador: pontuacao.jogador,
    segundos: pontuacao.segundos,
  };
}

export function paraEntradaRanking(corpo: unknown): EntradaRanking {
  if (!corpo || typeof corpo !== "object") {
    throw new DadosInvalidos("Corpo da requisição inválido.");
  }

  const { jogador, dificuldade, segundos } = corpo as Record<string, unknown>;

  if (typeof jogador !== "string" || !jogador.trim()) {
    throw new DadosInvalidos("Campo 'jogador' é obrigatório.");
  }
  if (!ehDificuldade(dificuldade)) {
    throw new DadosInvalidos("Campo 'dificuldade' deve ser 'facil' ou 'dificil'.");
  }
  if (typeof segundos !== "number" || !Number.isFinite(segundos) || segundos <= 0) {
    throw new DadosInvalidos("Campo 'segundos' deve ser um número positivo.");
  }

  return { jogador, dificuldade, segundos };
}

/** DTO de entrada → entidade pronta para o banco. */
export function paraNovaPontuacao(entrada: EntradaRanking): NovaPontuacaoSala6 {
  return {
    jogador: entrada.jogador.trim().slice(0, MAX_NOME),
    dificuldade: entrada.dificuldade,
    segundos: Math.round(entrada.segundos),
  };
}
