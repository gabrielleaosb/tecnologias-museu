import type { CSSProperties } from "react";
import { coresSala6 } from "@/lib/sala6/cores";
import { d, medidasSala6, PESO, TRACKING } from "@/lib/sala6/medidas";

const { botao } = medidasSala6;

interface BotaoProps {
  children: string;
  onClick: () => void;
  /** Cor de fundo — o protótipo alterna ocre, bege e bege-médio conforme a tela. */
  fundo: string;
  style?: CSSProperties;
}

/**
 * Botão retangular de 456×130 do PDF. Sem raio de canto: as formas do arquivo não
 * têm curvas, ao contrário dos campos da tela de novo jogo.
 */
export function Botao({ children, onClick, fundo, style }: BotaoProps) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center"
      style={{
        width: d(botao.largura),
        height: d(botao.altura),
        backgroundColor: fundo,
        color: coresSala6.marrom,
        fontSize: d(botao.texto),
        fontWeight: PESO.demi,
        letterSpacing: TRACKING.normal,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
