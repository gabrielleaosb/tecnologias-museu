import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { depoimentos } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
import { coresAdmin } from "@/lib/admin/cores";
import { ListaDepoimentos } from "@/components/admin/ListaDepoimentos";
import { BotaoLogout } from "@/components/admin/BotaoLogout";
import type { DepoimentoPublico } from "@/lib/socket/eventos";

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
    <div className="min-h-screen w-full p-8 sm:p-12" style={{ backgroundColor: coresAdmin.fundo }}>
      <div className="mb-12 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">DEPOIMENTOS</h1>
        <div className="flex gap-4">
          <a
            href="/api/admin/relatorio"
            className="rounded-md px-5 py-2 font-bold cursor-pointer"
            style={{ backgroundColor: coresAdmin.botaoAcao, color: coresAdmin.fundo }}
          >
            Criar Relatório
          </a>
          <BotaoLogout />
        </div>
      </div>

      <ListaDepoimentos depoimentosIniciais={lista} />
    </div>
  );
}
