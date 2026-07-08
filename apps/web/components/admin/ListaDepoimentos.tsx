"use client";

import { useState } from "react";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresAdmin } from "@/lib/admin/cores";

export function ListaDepoimentos({ depoimentosIniciais }: { depoimentosIniciais: DepoimentoPublico[] }) {
  const [depoimentos, setDepoimentos] = useState(depoimentosIniciais);

  async function deletarMensagem(id: string) {
    const resposta = await fetch(`/api/depoimentos/${id}`, { method: "PATCH" });
    if (resposta.ok) {
      setDepoimentos((atual) => atual.map((d) => (d.id === id ? { ...d, texto: null } : d)));
    }
  }

  async function deletarTudo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este depoimento permanentemente?")) return;
    const resposta = await fetch(`/api/depoimentos/${id}`, { method: "DELETE" });
    if (resposta.ok) {
      setDepoimentos((atual) => atual.filter((d) => d.id !== id));
    }
  }

  if (depoimentos.length === 0) {
    return <p className="text-white/70">Nenhum depoimento registrado ainda.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
      {depoimentos.map((d) => (
        <div key={d.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative h-28 w-40 overflow-hidden rounded-md bg-black">
              {d.tipo === "video" ? (
                <video src={d.arquivoUrl} muted preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <img src={d.arquivoUrl} alt={d.nome} className="h-full w-full object-cover" />
              )}
            </div>
            <span className="text-sm font-bold text-white">{d.nome.toUpperCase()}</span>
          </div>

          <div className="rounded-md p-4" style={{ backgroundColor: coresAdmin.cardMensagem }}>
            <p className="text-xs font-bold text-white">DEIXOU ESTA MENSAGEM:</p>
            <p className="mt-1 text-sm text-white/90">{d.texto ?? "(sem mensagem)"}</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => deletarMensagem(d.id)}
              disabled={!d.texto}
              className="rounded-md px-4 py-2 text-sm font-bold text-white cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: coresAdmin.botaoDeletar }}
            >
              Deletar mensagem
            </button>
            <button
              onClick={() => deletarTudo(d.id)}
              className="rounded-md px-4 py-2 text-sm font-bold text-white cursor-pointer"
              style={{ backgroundColor: coresAdmin.botaoDeletar }}
            >
              Deletar tudo
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
