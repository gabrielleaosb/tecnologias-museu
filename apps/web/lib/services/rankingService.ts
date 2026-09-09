import type { LinhaRanking, Ranking } from "@/lib/dtos/rankingDto";
import { rankingRepository } from "@/lib/repositories/rankingRepository";
import {
  paraEntradaRanking,
  paraLinhaRanking,
  paraNovaPontuacao,
} from "@/lib/mappers/rankingMapper";
import { ORDEM_DIFICULDADES } from "@/lib/sala6/dificuldades";
import { DadosInvalidos, RegistroNaoEncontrado } from "@/lib/erros/dominio";

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O id vem da URL, então pode ser qualquer coisa. Sem esta checagem o texto vai
 * cru para o Postgres, que rejeita o uuid malformado com um erro de banco — e o
 * visitante receberia um 500 onde a resposta correta é 400.
 */
function garantirId(id: string): string {
  if (!FORMATO_UUID.test(id)) {
    throw new DadosInvalidos("Identificador inválido.");
  }
  return id;
}

/**
 * Regras do placar. É a camada que o controller chama: nenhuma rota conhece o
 * repository nem o mapper diretamente.
 */
export const rankingService = {
  /** Monta as duas colunas do placar em paralelo, na ordem que a tela desenha. */
  async montarRanking(): Promise<Ranking> {
    const colunas = await Promise.all(
      ORDEM_DIFICULDADES.map((dificuldade) =>
        rankingRepository.listarPorDificuldade(dificuldade)
      )
    );

    return Object.fromEntries(
      ORDEM_DIFICULDADES.map((dificuldade, i) => [
        dificuldade,
        colunas[i].map(paraLinhaRanking),
      ])
    ) as Ranking;
  },

  async registrar(corpo: unknown): Promise<LinhaRanking> {
    const entrada = paraEntradaRanking(corpo);
    const criada = await rankingRepository.criar(paraNovaPontuacao(entrada));
    return paraLinhaRanking(criada);
  },

  async substituir(id: string, corpo: unknown): Promise<LinhaRanking> {
    const entrada = paraEntradaRanking(corpo);
    const atualizada = await rankingRepository.substituir(
      garantirId(id),
      paraNovaPontuacao(entrada)
    );

    if (!atualizada) throw new RegistroNaoEncontrado("Pontuação não encontrada.");
    return paraLinhaRanking(atualizada);
  },

  async remover(id: string): Promise<LinhaRanking> {
    const removida = await rankingRepository.remover(garantirId(id));

    if (!removida) throw new RegistroNaoEncontrado("Pontuação não encontrada.");
    return paraLinhaRanking(removida);
  },
};
