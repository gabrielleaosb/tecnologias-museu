import type { ReactNode } from "react";
import { coresSala6 } from "@/lib/sala6/cores";
import { d, medidasSala6, PESO, TRACKING } from "@/lib/sala6/medidas";
import { Botao } from "@/components/sala6/Botao";
import { Casa, type VarianteCasa } from "@/components/sala6/Casa";
import { LogoSala6 } from "@/components/sala6/LogoSala6";

const { cartao } = medidasSala6;

interface TelaDialogoProps {
  fundo: string;
  logo: "bege" | "marrom";
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  /** Casinha dentro do cartão, abaixo dos botões. Ausente quando a saída é um botão. */
  casa?: { variante: VarianteCasa; x: number; y: number; rotulo: string; onClick: () => void };
}

/**
 * Moldura das telas de diálogo — "recomeçar?" (p.5), "você venceu!" (p.9) e
 * "você perdeu" (p.10). As três repetem o mesmo cartão de 728×756 na mesma posição,
 * a mesma logo em marca-d'água à esquerda e os mesmos botões de 456×130; o que muda
 * é a paleta e o que vai dentro.
 */
export function TelaDialogo({
  fundo,
  logo,
  titulo,
  subtitulo,
  children,
  casa,
}: TelaDialogoProps) {
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: fundo }}>
      <LogoSala6 variante={logo} x={132} y={350} largura={363} opacidade={0.3} />

      <div
        className="absolute"
        style={{
          left: d(cartao.x),
          top: d(cartao.y),
          width: d(cartao.largura),
          height: d(cartao.altura),
          backgroundColor: coresSala6.bege,
        }}
      >
        <h1
          className="w-full text-center"
          style={{
            marginTop: d(subtitulo ? 84 : 104),
            color: coresSala6.marrom,
            fontSize: d(52.1),
            fontWeight: PESO.extraBold,
            letterSpacing: TRACKING.largo,
            textIndent: TRACKING.largo,
            lineHeight: 1.23,
          }}
        >
          {titulo}
        </h1>

        {subtitulo && (
          <p
            className="w-full text-center"
            style={{
              marginTop: d(16),
              color: coresSala6.marrom,
              fontSize: d(30),
              fontWeight: PESO.demi,
              letterSpacing: TRACKING.largo,
              textIndent: TRACKING.largo,
              lineHeight: 1.2,
            }}
          >
            {subtitulo}
          </p>
        )}

        {children}
      </div>

      {casa && (
        <Casa
          variante={casa.variante}
          x={casa.x}
          y={casa.y}
          onClick={casa.onClick}
          rotuloAcessivel={casa.rotulo}
        />
      )}
    </div>
  );
}

/** Posiciona um botão do diálogo em coordenadas absolutas da página. */
export function BotaoDialogo({
  children,
  onClick,
  fundo,
  y,
}: {
  children: string;
  onClick: () => void;
  fundo: string;
  y: number;
}) {
  return (
    <Botao
      onClick={onClick}
      fundo={fundo}
      style={{ position: "absolute", left: d(732 - cartao.x), top: d(y - cartao.y) }}
    >
      {children}
    </Botao>
  );
}
