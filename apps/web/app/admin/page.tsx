import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
import { coresAdmin } from "@/lib/admin/cores";
import { medidasAdmin, u, UNIDADE_ADMIN } from "@/lib/admin/medidas";
import { ListaDepoimentos } from "@/components/admin/ListaDepoimentos";
import { BotaoLogout } from "@/components/admin/BotaoLogout";
import type { DepoimentoPublico } from "@/lib/socket/eventos";

const { cabecalho: c } = medidasAdmin;

export default async function AdminPage() {
  const linhas = await db.select().from(depoimentos).orderBy(desc(depoimentos.criadoEm));

  const lista: DepoimentoPublico[] = linhas.map((d) => ({
    id: d.id,
    nome: d.nome,
    pais: d.pais,
    estado: d.estado,
    tipo: d.tipo as "foto" | "video",
    arquivoUrl: d.arquivoUrl,
    texto: d.texto,
    prestigios: d.prestigios,
    criadoEm: d.criadoEm.toISOString(),
  }));

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: coresAdmin.fundo }}>
      {/* container-type: inline-size faz `1cqw` valer 1% da largura desta caixa.
          As medidas em `u` ficam nos filhos: num elemento que é ele mesmo o container,
          unidades cq resolvem contra o container de fora, não contra ele próprio. */}
      <div
        className="mx-auto w-full"
        style={
          {
            "--u": UNIDADE_ADMIN,
            containerType: "inline-size",
            maxWidth: medidasAdmin.larguraMaxima,
          } as React.CSSProperties
        }
      >
        <div style={{ paddingTop: u(3.5), paddingBottom: u(6) }}>
        <header
          className="flex items-end justify-between"
          style={{ paddingInline: u(c.padding), marginBottom: u(5.63) }}
        >
          <h1
            style={{
              color: coresAdmin.texto,
              fontSize: u(c.titulo),
              fontWeight: 300,
              letterSpacing: "0.105em",
              lineHeight: 1,
            }}
          >
            DEPOIMENTOS
          </h1>

          <div className="flex" style={{ gap: u(c.botao.espaco) }}>
            <a
              href="/api/admin/relatorio"
              className="flex cursor-pointer items-center justify-center"
              style={{
                width: u(c.larguraRelatorio),
                height: u(c.botao.altura),
                backgroundColor: coresAdmin.botaoAcao,
                color: coresAdmin.fundo,
                fontSize: u(c.botao.texto),
              }}
            >
              Criar Relatório
            </a>
            <BotaoLogout />
          </div>
        </header>

          <ListaDepoimentos depoimentosIniciais={lista} />
        </div>
      </div>
    </div>
  );
}
