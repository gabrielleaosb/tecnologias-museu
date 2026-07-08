import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";
import { verificarSessionToken, COOKIE_SESSAO } from "@/lib/auth/session";

function csvEscapar(valor: string): string {
  if (valor.includes(",") || valor.includes('"') || valor.includes("\n")) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_SESSAO}=([^;]+)`));
  if (!verificarSessionToken(match?.[1])) {
    return new Response("Não autenticado.", { status: 401 });
  }

  const linhas = await db.select().from(depoimentos).orderBy(desc(depoimentos.criadoEm));

  const cabecalho = ["Nome", "Email", "País", "Estado", "Tipo", "Mensagem", "Prestígios", "Data"];
  const corpo = linhas.map((d) =>
    [d.nome, d.email, d.pais, d.estado, d.tipo, d.texto ?? "", String(d.prestigios), d.criadoEm.toISOString()]
      .map(csvEscapar)
      .join(","),
  );

  const csv = [cabecalho.join(","), ...corpo].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="depoimentos-${Date.now()}.csv"`,
    },
  });
}
