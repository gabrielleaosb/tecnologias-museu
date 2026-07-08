import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";
import { removerArquivoDepoimento } from "@/lib/uploads";
import { getIO } from "@/lib/socket/server-instance";
import { SALA7_ROOM } from "@/lib/socket/eventos";
import { verificarSessionToken, COOKIE_SESSAO } from "@/lib/auth/session";

function autenticado(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_SESSAO}=([^;]+)`));
  return verificarSessionToken(match?.[1]) !== null;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!autenticado(request)) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const [removido] = await db.delete(depoimentos).where(eq(depoimentos.id, id)).returning();
  if (!removido) {
    return NextResponse.json({ erro: "Depoimento não encontrado." }, { status: 404 });
  }

  await removerArquivoDepoimento(removido.arquivoUrl);
  getIO()?.to(SALA7_ROOM).emit("sala7:depoimento-removido", { id });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!autenticado(request)) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  const [atualizado] = await db
    .update(depoimentos)
    .set({ texto: null })
    .where(eq(depoimentos.id, id))
    .returning();

  if (!atualizado) {
    return NextResponse.json({ erro: "Depoimento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
