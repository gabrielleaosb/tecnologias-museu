import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";
import { salvarArquivoDepoimento } from "@/lib/uploads";
import { getIO } from "@/lib/socket/server-instance";
import { SALA7_ROOM, type DepoimentoPublico } from "@/lib/socket/eventos";

function paraDepoimentoPublico(d: typeof depoimentos.$inferSelect): DepoimentoPublico {
  return {
    id: d.id,
    nome: d.nome,
    pais: d.pais,
    estado: d.estado,
    tipo: d.tipo as "foto" | "video",
    arquivoUrl: d.arquivoUrl,
    texto: d.texto,
    prestigios: d.prestigios,
    criadoEm: d.criadoEm.toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const ordenar = searchParams.get("ordenar");

  const linhas = await db
    .select()
    .from(depoimentos)
    .orderBy(ordenar === "prestigiados" ? desc(depoimentos.prestigios) : desc(depoimentos.criadoEm));

  const filtradas = tipo === "foto" || tipo === "video" ? linhas.filter((d) => d.tipo === tipo) : linhas;

  return NextResponse.json(filtradas.map(paraDepoimentoPublico));
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const nome = formData.get("nome");
  const email = formData.get("email");
  const pais = formData.get("pais");
  const estado = formData.get("estado");
  const tipo = formData.get("tipo");
  const texto = formData.get("texto");
  const autorizacaoImagem = formData.get("autorizacaoImagem");
  const arquivo = formData.get("arquivo");

  if (
    typeof nome !== "string" ||
    !nome.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof pais !== "string" ||
    typeof estado !== "string" ||
    (tipo !== "foto" && tipo !== "video") ||
    !(arquivo instanceof File)
  ) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const arquivoUrl = await salvarArquivoDepoimento(arquivo);

  const [novo] = await db
    .insert(depoimentos)
    .values({
      nome: nome.trim(),
      email: email.trim(),
      pais,
      estado,
      tipo,
      arquivoUrl,
      texto: typeof texto === "string" && texto.trim() ? texto.trim() : null,
      autorizacaoImagem: autorizacaoImagem === "true",
    })
    .returning();

  const publico = paraDepoimentoPublico(novo);
  getIO()?.to(SALA7_ROOM).emit("sala7:novo-depoimento", publico);

  return NextResponse.json(publico, { status: 201 });
}
