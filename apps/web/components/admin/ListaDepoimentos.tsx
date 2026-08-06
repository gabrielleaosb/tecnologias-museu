"use client";

import { useState } from "react";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresAdmin } from "@/lib/admin/cores";
import { medidasAdmin, u } from "@/lib/admin/medidas";

const { lista: m, nome: mNome, mensagem: mMsg, acao: mAcao } = medidasAdmin;

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
    return (
      <p style={{ paddingInline: u(m.padding), color: coresAdmin.texto, fontSize: u(mAcao.texto), opacity: 0.7 }}>
        Nenhum depoimento registrado ainda.
      </p>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ paddingInline: u(m.padding), gap: u(m.espacoVertical) }}
    >
      {depoimentos.map((d) => (
        <div key={d.id} className="flex items-start">
          <div className="flex-none" style={{ width: u(m.colunas.midia) }}>
            <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
              {d.tipo === "video" ? (
                <video src={d.arquivoUrl} muted preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <img src={d.arquivoUrl} alt={d.nome} className="h-full w-full object-cover" />
              )}
              {d.tipo === "video" && <TrianguloPlay />}
            </div>

            <span
              className="block w-full truncate font-bold"
              style={{
                marginTop: u(mNome.espacoAcima),
                color: coresAdmin.texto,
                fontSize: u(mNome.texto),
                letterSpacing: u(mNome.espacamento),
              }}
            >
              {d.nome.toUpperCase()}
            </span>

            <div style={{ marginTop: u(mAcao.espacoAposNome), width: u(m.colunas.acoes) }}>
              <BotaoDeletar onClick={() => deletarTudo(d.id)}>Deletar tudo</BotaoDeletar>
            </div>
          </div>

          <div
            className="flex-none"
            style={{
              marginLeft: u(m.espacoColunas.midiaMensagem),
              marginTop: u(mMsg.deslocamentoTopo),
              width: u(m.colunas.mensagem),
            }}
          >
            <div
              style={{
                minHeight: u(mMsg.alturaMinima),
                padding: u(mMsg.padding),
                backgroundColor: coresAdmin.cardMensagem,
              }}
            >
              <p
                className="font-bold"
                style={{ color: coresAdmin.texto, fontSize: u(mMsg.titulo), letterSpacing: u(mMsg.espacamento) }}
              >
                DEIXOU ESTA MENSAGEM:
              </p>
              <p
                className="text-justify"
                style={{
                  marginTop: u(mMsg.espacoTitulo),
                  color: coresAdmin.texto,
                  fontSize: u(mMsg.corpo),
                  lineHeight: 1.55,
                }}
              >
                {d.texto ?? "(sem mensagem)"}
              </p>
            </div>

            <div style={{ marginTop: u(mAcao.espacoAposMensagem), width: u(m.colunas.acoes), marginInline: "auto" }}>
              <BotaoDeletar onClick={() => deletarMensagem(d.id)} desabilitado={!d.texto}>
                Deletar mensagem
              </BotaoDeletar>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BotaoDeletar({
  onClick,
  desabilitado = false,
  children,
}: {
  onClick: () => void;
  desabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        height: u(mAcao.altura),
        backgroundColor: coresAdmin.botaoDeletar,
        color: coresAdmin.texto,
        fontSize: u(mAcao.texto),
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

// No protótipo o indicador de vídeo é um triângulo branco sólido, sem círculo em volta.
function TrianguloPlay() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: u(3.8), height: u(3.8) }}
      aria-hidden
    >
      <polygon points="20,8 92,50 20,92" fill="#FFFFFF" />
    </svg>
  );
}
