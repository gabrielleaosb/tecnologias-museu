import { NextResponse } from "next/server";
import { ErroDominio } from "@/lib/erros/dominio";

/**
 * Tratamento de exceção centralizado das rotas.
 *
 * Erro de domínio vira a resposta que ele descreve. Qualquer outro — falha do
 * banco, bug — vira 500 genérico, e o detalhe fica no log do servidor em vez de
 * ir para a tela: o totem fica sozinho no museu, então a mensagem que o visitante
 * vê não pode depender de o erro ter sido previsto.
 */
export function comTratamentoDeErro<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (erro) {
      if (erro instanceof ErroDominio) {
        return NextResponse.json({ erro: erro.message }, { status: erro.status });
      }

      console.error("[api] erro não tratado:", erro);
      return NextResponse.json({ erro: "Erro interno do servidor." }, { status: 500 });
    }
  };
}
