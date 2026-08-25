"use client";

import { useState } from "react";
import { coresSala7 } from "@/lib/sala7/cores";
import { galeria, g, PESO } from "@/lib/sala7/medidas";

export type FiltroTipo = "todos" | "foto" | "video";
export type Ordenacao = "recentes" | "prestigiados";

interface PainelFiltroProps {
  tipo: FiltroTipo;
  ordenacao: Ordenacao;
  onTipoChange: (tipo: FiltroTipo) => void;
  onOrdenacaoChange: (ordenacao: Ordenacao) => void;
}

/**
 * Painel de filtro, flutuando sobre a quarta coluna de cards.
 *
 * **Em repouso é só a barra FILTRAR**; tocar nela abre as quatro opções, e escolher
 * uma fecha de novo. O protótipo desenha o painel sempre aberto, mas aberto ele cobre
 * um card inteiro da quarta coluna o tempo todo — fechado, ocupa só a faixa acima da
 * grade, onde não há card nenhum. Como o filtro é usado uma vez e a galeria fica
 * exposta o resto do tempo, o padrão passa a ser a galeria inteira visível.
 *
 * O protótipo também não marca item ativo — os quatro saem iguais. Aqui eles de fato
 * ligam e desligam, então o ativo ganha o peso Heavy: sem isso, ao reabrir o painel
 * não haveria como saber o que está valendo.
 */
export function PainelFiltro({ tipo, ordenacao, onTipoChange, onOrdenacaoChange }: PainelFiltroProps) {
  const [aberto, setAberto] = useState(false);
  const { filtro } = galeria;

  const itens = [
    { rotulo: "Fotos", ativo: tipo === "foto", acionar: () => onTipoChange(tipo === "foto" ? "todos" : "foto") },
    { rotulo: "Vídeos", ativo: tipo === "video", acionar: () => onTipoChange(tipo === "video" ? "todos" : "video") },
    { rotulo: "Mais recentes", ativo: ordenacao === "recentes", acionar: () => onOrdenacaoChange("recentes") },
    { rotulo: "Mais prestigiados", ativo: ordenacao === "prestigiados", acionar: () => onOrdenacaoChange("prestigiados") },
  ];

  return (
    <div className="flex flex-col overflow-hidden" style={{ width: g(filtro.largura) }}>
      <button
        onClick={() => setAberto((estava) => !estava)}
        aria-expanded={aberto}
        className="flex w-full cursor-pointer items-center justify-center uppercase"
        style={{
          height: g(filtro.cabecalho.altura),
          backgroundColor: coresSala7.painelCabecalho,
          color: coresSala7.textoClaro,
          fontSize: g(filtro.cabecalho.texto),
          fontWeight: PESO.bold,
          letterSpacing: g(filtro.cabecalho.tracking),
        }}
      >
        Filtrar
      </button>

      {aberto && (
        <div style={{ backgroundColor: coresSala7.painelCorpo }}>
          {itens.map((item, indice) => (
            <button
              key={item.rotulo}
              onClick={() => {
                item.acionar();
                setAberto(false);
              }}
              className="flex w-full cursor-pointer items-center justify-center"
              style={{
                height: g(filtro.item.altura),
                color: coresSala7.textoClaro,
                fontSize: g(filtro.item.texto),
                fontWeight: item.ativo ? PESO.heavy : PESO.medium,
                // O fio só separa itens vizinhos; sobre o cabeçalho ele não existe.
                borderTop: indice === 0 ? undefined : `1px solid rgba(255, 247, 228, 0.35)`,
              }}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
