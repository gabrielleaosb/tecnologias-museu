import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pontuacoesSala6 } from "@/lib/db/schema";
import { ehDificuldade, ORDEM_DIFICULDADES, type Dificuldade } from "@/lib/sala6/dificuldades";

/** Quantas colocações cada coluna do ranking carrega. O protótipo mostra 5 e rola. */
const LIMITE = 50;

/** Teto do nome do jogador, que vem de um campo livre num totem público. */
const MAX_NOME = 24;

export interface LinhaRanking {
  id: string;
  jogador: string;
  segundos: number;
}

export type Ranking = Record<Dificuldade, LinhaRanking[]>;

async function lerRanking(dificuldade: Dificuldade): Promise<LinhaRanking[]> {
  const linhas = await db
    .select()
    .from(pontuacoesSala6)
    .where(eq(pontuacoesSala6.dificuldade, dificuldade))
    // Desempate pela data: entre dois tempos iguais, quem chegou primeiro fica na frente.
    .orderBy(asc(pontuacoesSala6.segundos), asc(pontuacoesSala6.criadoEm))
    .limit(LIMITE);

  return linhas.map((l) => ({ id: l.id, jogador: l.jogador, segundos: l.segundos }));
}

export async function GET() {
  const colunas = await Promise.all(ORDEM_DIFICULDADES.map(lerRanking));
  const ranking = Object.fromEntries(
    ORDEM_DIFICULDADES.map((d, i) => [d, colunas[i]])
  ) as Ranking;

  return NextResponse.json(ranking);
}

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);
  if (!corpo || typeof corpo !== "object") {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const { jogador, dificuldade, segundos } = corpo as Record<string, unknown>;

  if (
    typeof jogador !== "string" ||
    !jogador.trim() ||
    !ehDificuldade(dificuldade) ||
    typeof segundos !== "number" ||
    !Number.isFinite(segundos) ||
    segundos <= 0
  ) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const [nova] = await db
    .insert(pontuacoesSala6)
    .values({
      jogador: jogador.trim().slice(0, MAX_NOME),
      dificuldade,
      segundos: Math.round(segundos),
    })
    .returning();

  return NextResponse.json({ id: nova.id }, { status: 201 });
}
