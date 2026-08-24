"use client";

import { useState } from "react";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";

// Canvas 1920×1080. Seletor genérico usado pelos campos PAÍS e ESTADO da TelaOrigem.
// A barra fechada é visualmente idêntica ao campo de digitação do protótipo; o que muda
// é que tocar nela abre um painel de opções em vez de chamar o teclado.
interface SeletorOpcaoProps {
  valor: string;
  opcoes: readonly string[];
  onChange: (valor: string) => void;
  estilo: React.CSSProperties;
  placeholder: string;
  titulo: string;
  colunas: number;
  larguraColuna: string;
  desabilitado?: boolean;
}

export function SeletorOpcao({
  valor,
  opcoes,
  onChange,
  estilo,
  placeholder,
  titulo,
  colunas,
  larguraColuna,
  desabilitado = false,
}: SeletorOpcaoProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={desabilitado}
        onClick={() => setAberto(true)}
        className="flex items-center justify-center disabled:cursor-not-allowed enabled:cursor-pointer"
        style={{ ...estilo, gap: "0.6vw", opacity: desabilitado ? 0.45 : 1 }}
      >
        {/* Escolhido sai em Heavy, como o valor digitado dos outros campos; o
            placeholder fica em Medium, para os dois não se confundirem. */}
        <span style={{ fontWeight: valor ? 900 : 500, opacity: valor ? 1 : 0.75 }}>
          {valor || placeholder}
        </span>
        {/* Sem esta seta a barra fica idêntica a um campo de digitação e nada indica
            que ela abre uma lista. Some quando o campo está desabilitado. */}
        {!desabilitado && (
          <span aria-hidden style={{ fontSize: "0.8vw", lineHeight: 1 }}>
            ▼
          </span>
        )}
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ backgroundColor: cores.overlayEscuro }}
          onClick={() => setAberto(false)}
        >
          <div
            className="flex max-h-[88vh] flex-col"
            style={{
              backgroundColor: cores.fundoClaro,
              padding: "2vw",
              gap: "1.2vw",
              borderRadius: "0.42vw",
            }}
            onClick={(evento) => evento.stopPropagation()}
          >
            <p className="text-center font-medium" style={ESCADA.texto.secundario}>
              {titulo}
            </p>

            <div
              className="grid overflow-y-auto overflow-x-hidden"
              style={{
                gridTemplateColumns: `repeat(${colunas}, ${larguraColuna})`,
                columnGap: "0.8vw",
                rowGap: "0.9vh",
                // Sem isto, a barra de rolagem vertical rouba largura das colunas fixas
                // e aparece uma barra horizontal por causa dos poucos pixels que sobram.
                scrollbarGutter: "stable",
              }}
            >
              {opcoes.map((opcao) => {
                const selecionado = opcao === valor;
                return (
                  <button
                    key={opcao}
                    type="button"
                    // Em listas longas (países) a opção atual pode estar fora da área
                    // visível; ao abrir, o painel rola até ela.
                    ref={
                      selecionado
                        ? (elemento) => elemento?.scrollIntoView({ block: "center" })
                        : undefined
                    }
                    onClick={() => {
                      onChange(opcao);
                      setAberto(false);
                    }}
                    className="flex cursor-pointer items-center justify-center text-center"
                    style={{
                      /**
                       * Altura mínima, não fixa, e texto que quebra em duas linhas.
                       * Com altura travada e linha única, nomes como "República
                       * Democrática do Congo" — 30 caracteres, contra os ~14 que
                       * cabem na coluna — vazavam para fora do botão e invadiam o
                       * vizinho. A linha da grade cresce junto com o item mais alto,
                       * então as colunas continuam alinhadas.
                       */
                      minHeight: "5.5vh",
                      lineHeight: 1.15,
                      overflowWrap: "break-word",
                      hyphens: "auto",
                      borderRadius: "0.21vw",
                      backgroundColor: selecionado ? cores.laranja : "#E2B291",
                      color: cores.textoEscuro,
                      // Menor que o campo fechado: aqui o que manda é caber na coluna,
                      // e o painel não vem do protótipo.
                      fontSize: "1.45vw",
                      fontWeight: selecionado ? 700 : 400,
                      padding: "0.4vh 0.6vw",
                    }}
                  >
                    {opcao}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
