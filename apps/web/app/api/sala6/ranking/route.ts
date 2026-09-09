import { NextResponse } from "next/server";
import { rankingService } from "@/lib/services/rankingService";
import { comTratamentoDeErro } from "@/lib/erros/http";

/**
 * Controller da coleção de pontuações da Sala 6.
 *
 * Só traduz HTTP: lê a requisição, chama o service e escolhe o status. Não conhece
 * o banco, não valida campo e não trata exceção — o wrapper faz isso por ele.
 */

/** GET /api/sala6/ranking — o placar completo, uma coluna por dificuldade. */
export const GET = comTratamentoDeErro(async () => {
  return NextResponse.json(await rankingService.montarRanking());
});

/** POST /api/sala6/ranking — registra uma partida vencida. */
export const POST = comTratamentoDeErro(async (request: Request) => {
  const corpo = await request.json().catch(() => null);
  const criada = await rankingService.registrar(corpo);

  return NextResponse.json(criada, { status: 201 });
});
