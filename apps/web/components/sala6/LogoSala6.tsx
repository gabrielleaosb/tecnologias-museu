import Image from "next/image";
import { d } from "@/lib/sala6/medidas";

/**
 * Logo vertical do museu. O PDF a usa em seis posições e tamanhos diferentes, sempre
 * com a mesma proporção (0,927), e quase sempre rebaixada por transparência para
 * virar marca-d'água atrás do conteúdo.
 *
 * Só existem as variantes bege e marrom: nas telas de fundo claro entra a marrom,
 * nas de fundo escuro a bege.
 */
interface LogoSala6Props {
  variante: "bege" | "marrom";
  /** Canto superior esquerdo, em coordenadas do PDF. */
  x: number;
  y: number;
  /** Largura em coordenadas do PDF; a altura sai da proporção. */
  largura: number;
  opacidade?: number;
}

const PROPORCAO = 0.927;

export function LogoSala6({ variante, x, y, largura, opacidade = 1 }: LogoSala6Props) {
  return (
    <Image
      src={`/icons/sala6/logo-vertical-${variante}.png`}
      alt="Museu do Sertão — Piranhas, AL"
      width={726}
      height={784}
      priority
      className="absolute"
      style={{
        left: d(x),
        top: d(y),
        width: d(largura),
        height: d(largura / PROPORCAO),
        opacity: opacidade,
      }}
    />
  );
}
