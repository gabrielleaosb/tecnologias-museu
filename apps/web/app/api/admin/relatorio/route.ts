import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos, type Depoimento } from "@/lib/db/schema";
import { verificarSessionToken, COOKIE_SESSAO } from "@/lib/auth/session";

const SEPARADOR = "-".repeat(60);
const NAO_INFORMADO = "(não informado)";

/** Conta valores distintos ignorando caixa e espaços em volta ("alagoas" = "Alagoas "). */
function contarDistintos(valores: string[]): number {
  return new Set(valores.map((v) => v.trim().toLocaleLowerCase("pt-BR")).filter(Boolean)).size;
}

function pluralizar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/**
 * A tabela `depoimentos` não tem coluna de telefone e a Escada só pede Nome e E-mail,
 * então isto devolve sempre null e o relatório imprime "(não informado)". Quando a
 * coluna existir, trocar o corpo por `return depoimento.telefone;`.
 */
function telefoneDe(_depoimento: Depoimento): string | null {
  return null;
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${COOKIE_SESSAO}=([^;]+)`));
  if (!verificarSessionToken(match?.[1])) {
    return new Response("Não autenticado.", { status: 401 });
  }

  const linhas = await db.select().from(depoimentos).orderBy(desc(depoimentos.criadoEm));

  const geradoEm = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Maceio",
  }).format(new Date());

  const conteudo: string[] = [
    "RELATÓRIO DE DEPOIMENTOS",
    "Museu do Sertão — Piranhas, AL",
    `Gerado em ${geradoEm}`,
    "",
    pluralizar(linhas.length, "visitante", "visitantes"),
    pluralizar(contarDistintos(linhas.map((d) => d.estado)), "estado", "estados"),
    pluralizar(contarDistintos(linhas.map((d) => d.pais)), "país", "países"),
    "",
  ];

  for (const d of linhas) {
    conteudo.push(
      SEPARADOR,
      `- Nome: ${d.nome}`,
      `- Email: ${d.email}`,
      `- Telefone: ${telefoneDe(d)?.trim() || NAO_INFORMADO}`,
    );
  }

  conteudo.push(SEPARADOR, "");

  // CRLF para o arquivo abrir com as quebras corretas no Bloco de Notas do Windows,
  // que é onde o museu vai abrir isso.
  const txt = conteudo.join("\r\n");

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="depoimentos-${Date.now()}.txt"`,
    },
  });
}
