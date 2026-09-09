import { NextResponse } from "next/server";
import { rankingService } from "@/lib/services/rankingService";
import { comTratamentoDeErro } from "@/lib/erros/http";

/**
 * Controller de uma pontuação específica. Endpoints de moderação do placar: servem
 * para corrigir ou remover um registro, não fazem parte do fluxo do visitante.
 */

type Contexto = { params: Promise<{ id: string }> };

/**
 * PUT /api/sala6/ranking/:id — substituição completa.
 *
 * Diferente de um PATCH: exige `jogador`, `dificuldade` e `segundos`, e reescreve
 * o recurso inteiro com o que veio. Campo omitido é erro, não "manter o atual".
 */
export const PUT = comTratamentoDeErro(async (request: Request, { params }: Contexto) => {
  const { id } = await params;
  const corpo = await request.json().catch(() => null);

  return NextResponse.json(await rankingService.substituir(id, corpo));
});

/** DELETE /api/sala6/ranking/:id — remove a pontuação e devolve o que saiu. */
export const DELETE = comTratamentoDeErro(async (_request: Request, { params }: Contexto) => {
  const { id } = await params;

  return NextResponse.json(await rankingService.remover(id));
});
