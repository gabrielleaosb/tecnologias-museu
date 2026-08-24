import Image from "next/image";
import { d } from "@/lib/sala6/medidas";

/**
 * Variantes da casinha de saída. Cada PNG já traz o rótulo (SAIR / VOLTAR / MENU)
 * desenhado abaixo do ícone e já vem na cor certa, então não há texto a renderizar
 * nem cor a aplicar — só posicionar. As larguras saem do próprio arquivo, que é @2x
 * do PDF: 134×218 no arquivo são 67×109 no canvas de projeto.
 */
export const CASAS = {
  voltarBege: { src: "/icons/sala6/voltar-bege.png", largura: 95 },
  sairBege: { src: "/icons/sala6/voltar-bege.png", largura: 95 },
  sairMarrom: { src: "/icons/sala6/sair-marrom.png", largura: 67 },
  sairMarromClaro: { src: "/icons/sala6/sair-marrom-claro.png", largura: 67 },
  sairBranco: { src: "/icons/sala6/sair-branco.png", largura: 67 },
  menuMarrom: { src: "/icons/sala6/menu-marrom.png", largura: 76 },
} as const;

/** Altura comum a todas as variantes: ícone (63) + respiro (12) + rótulo (34). */
const ALTURA = 109;

/**
 * Folga invisível ao redor do desenho, em cada lado.
 *
 * O alvo desenhado tem 67 de largura, o que num monitor touch grande é pequeno
 * demais para acertar sem mirar — e esta é a única saída da tela. A folga entra
 * como preenchimento, com a posição recuada no mesmo valor, de modo que a área
 * de toque cresce para os quatro lados sem que o ícone saia do lugar: 67×109
 * desenhados dentro de 147×189 clicáveis.
 */
const FOLGA_TOQUE = 40;

export type VarianteCasa = keyof typeof CASAS;

interface CasaProps {
  variante: VarianteCasa;
  onClick: () => void;
  /** Canto superior esquerdo do bloco inteiro, em coordenadas do PDF. */
  x: number;
  y: number;
  rotuloAcessivel: string;
}

export function Casa({ variante, onClick, x, y, rotuloAcessivel }: CasaProps) {
  const { src, largura } = CASAS[variante];

  return (
    <button
      onClick={onClick}
      aria-label={rotuloAcessivel}
      className="absolute cursor-pointer"
      style={{
        left: d(x - FOLGA_TOQUE),
        top: d(y - FOLGA_TOQUE),
        padding: d(FOLGA_TOQUE),
        // Dispensa a espera pelo duplo-toque de zoom, que na tela touch atrasa o
        // primeiro toque e faz o botão parecer que não respondeu.
        touchAction: "manipulation",
      }}
    >
      <Image
        src={src}
        alt=""
        width={largura * 2}
        height={ALTURA * 2}
        style={{ width: d(largura), height: d(ALTURA) }}
      />
    </button>
  );
}
