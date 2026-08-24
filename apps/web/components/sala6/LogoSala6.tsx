import Image from "next/image";
import { d } from "@/lib/sala6/medidas";

/**
 * Logo do museu nas telas da Sala 6.
 *
 * A escolha da variante segue o fundo da tela, não a preferência de cada uma:
 * fundo escuro pede a clara, fundo amarelo pede a escura. A tela de ranking, que tem
 * o cabeçalho baixo e largo, usa a horizontal.
 */
const VARIANTES = {
  clara: { src: "/icons/sala6/logo-vertical-clara.png", largura: 1512, altura: 1632 },
  escura: { src: "/icons/sala6/logo-vertical-escura.png", largura: 1180, altura: 1274 },
  horizontal: { src: "/icons/sala6/logo-horizontal.png", largura: 1125, altura: 334 },
} as const;

export type VarianteLogo = keyof typeof VARIANTES;

interface LogoSala6Props {
  variante: VarianteLogo;
  /**
   * Posição horizontal. Número é coordenada do PDF; texto é CSS cru, para os casos
   * em que o ponto de referência não está no canvas — ver `centralizar`.
   */
  x: number | string;
  y: number;
  /** Largura em coordenadas do PDF; a altura sai da proporção do arquivo. */
  largura: number;
  /** Trata `x` como o centro da logo, e não como a borda esquerda. */
  centralizar?: boolean;
  opacidade?: number;
}

export function LogoSala6({
  variante,
  x,
  y,
  largura,
  centralizar = false,
  opacidade = 1,
}: LogoSala6Props) {
  const asset = VARIANTES[variante];

  return (
    <Image
      src={asset.src}
      alt="Museu do Sertão — Piranhas, AL"
      // Dimensões reais do arquivo: é por elas que o next/image escolhe a resolução
      // a servir. Declarar um tamanho menor que o de exibição entrega uma imagem
      // borrada.
      width={asset.largura}
      height={asset.altura}
      priority
      className="absolute"
      style={{
        left: typeof x === "number" ? d(x) : x,
        top: d(y),
        width: d(largura),
        height: d((largura * asset.altura) / asset.largura),
        transform: centralizar ? "translateX(-50%)" : undefined,
        opacity: opacidade,
      }}
    />
  );
}
