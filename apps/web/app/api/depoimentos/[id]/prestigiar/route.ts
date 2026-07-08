import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";
import { getIO } from "@/lib/socket/server-instance";
import { SALA7_ROOM } from "@/lib/socket/eventos";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [atualizado] = await db
    .update(depoimentos)
    .set({ prestigios: sql`${depoimentos.prestigios} + 1` })
    .where(eq(depoimentos.id, id))
    .returning();

  if (!atualizado) {
    return NextResponse.json({ erro: "Depoimento não encontrado." }, { status: 404 });
  }

  getIO()?.to(SALA7_ROOM).emit("sala7:prestigio-atualizado", { id, prestigios: atualizado.prestigios });

  return NextResponse.json({ prestigios: atualizado.prestigios });
}
