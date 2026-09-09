import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  pontuacoesSala6,
  type NovaPontuacaoSala6,
  type PontuacaoSala6,
} from "@/lib/db/schema";
import type { Dificuldade } from "@/lib/sala6/dificuldades";

/** Quantas colocações cada coluna do ranking carrega. O protótipo mostra 5 e rola. */
const LIMITE = 50;

export const rankingRepository = {
  async listarPorDificuldade(
    dificuldade: Dificuldade,
    limite: number = LIMITE
  ): Promise<PontuacaoSala6[]> {
    return db
      .select()
      .from(pontuacoesSala6)
      .where(eq(pontuacoesSala6.dificuldade, dificuldade))
      .orderBy(asc(pontuacoesSala6.segundos), asc(pontuacoesSala6.criadoEm))
      .limit(limite);
  },

  async buscarPorId(id: string): Promise<PontuacaoSala6 | null> {
    const [linha] = await db
      .select()
      .from(pontuacoesSala6)
      .where(eq(pontuacoesSala6.id, id))
      .limit(1);

    return linha ?? null;
  },

  async criar(nova: NovaPontuacaoSala6): Promise<PontuacaoSala6> {
    const [criada] = await db.insert(pontuacoesSala6).values(nova).returning();
    return criada;
  },

  /** Substituição completa (PUT): todos os campos do recurso são reescritos. */
  async substituir(
    id: string,
    dados: NovaPontuacaoSala6
  ): Promise<PontuacaoSala6 | null> {
    const [atualizada] = await db
      .update(pontuacoesSala6)
      .set(dados)
      .where(eq(pontuacoesSala6.id, id))
      .returning();

    return atualizada ?? null;
  },

  async remover(id: string): Promise<PontuacaoSala6 | null> {
    const [removida] = await db
      .delete(pontuacoesSala6)
      .where(eq(pontuacoesSala6.id, id))
      .returning();

    return removida ?? null;
  },
};
