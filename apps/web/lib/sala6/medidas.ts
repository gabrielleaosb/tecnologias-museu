// Medidas da Sala 6, extraídas do PDF "Jogo da memoria.pdf" (design/sala6/), que
// vem num canvas de 1920×1080 — o mesmo do XD das outras salas.
//
// Diferente do Admin, que rola verticalmente, e da Escada, que mistura vw e vh:
// aqui cada tela é uma composição fechada de 16:9 que precisa caber inteira, sem
// rolagem e sem deformar. Por isso a unidade é limitada pelos dois eixos ao mesmo
// tempo. Em telas mais largas que 16:9 sobra faixa nas laterais; em telas mais
// altas, em cima e embaixo — que é o certo, já que esticar desalinharia a grade
// de cartas em relação ao resto.
//
// Sem teto em pixels, ao contrário do Admin: o totem é tela cheia e ampliar até
// preencher um monitor 4K é justamente o que se quer.
export const UNIDADE_SALA6 = "min(1vw, 1.7778vh)";

/** 1u = 1% da largura de projeto = 19,2px do PDF. */
const PX_POR_UNIDADE = 19.2;

/**
 * Converte uma medida lida direto do PDF para CSS.
 *
 * Existe para que o código possa repetir os números do protótipo sem conversão
 * mental — `d(228)` é a carta de 228px do arquivo. Conferir uma tela contra o PDF
 * vira comparação literal de números.
 */
export function d(px: number): string {
  return `calc(var(--u) * ${(px / PX_POR_UNIDADE).toFixed(4)})`;
}

/**
 * Centro horizontal da área livre de um dos lados do painel central, medido na
 * **janela** e não no canvas.
 *
 * O canvas mantém 16:9 e é centralizado, então em monitores de outro formato sobra
 * uma faixa nas laterais — pintada com a cor da tela, o que a torna indistinguível
 * do fundo. Para quem olha, o amarelo da tela de novo jogo vai de borda a borda; um
 * elemento centralizado nos 596px de canvas à esquerda do painel aparece deslocado
 * para dentro, porque metade da área que ele deveria dividir está fora do canvas.
 *
 * A largura dessa sobra depende do formato do monitor, então não existe coordenada
 * fixa que resolva: a conta precisa misturar `vw` (a janela) com `--u` (o canvas).
 * Em 16:9 as duas coincidem e o resultado volta a ser o centro do canvas.
 *
 * @param bordaDoPainel coordenada de projeto da borda do painel que limita a faixa
 */
export function centroDaFaixa(lado: "esquerda" | "direita", bordaDoPainel: number): string {
  const fator = (25 + bordaDoPainel / (PX_POR_UNIDADE * 2)).toFixed(2);
  const sinal = lado === "esquerda" ? "-" : "";
  return `calc(${sinal}25vw + var(--u) * ${fator})`;
}

/**
 * Entreletra. O PDF usa três níveis bem definidos, medidos comparando a largura de
 * cada trecho com a largura natural da mesma string na fonte real (Futura PT dos
 * arquivos em public/fonts) — 27 dos 29 trechos medidos caem dentro de 0,19–0,20em
 * ou 0,49–0,50em, o que mostra que são dois valores escolhidos, e não variação.
 */
export const TRACKING = {
  /** Texto corrido, botões do menu e rótulos das casinhas: sem tratamento. */
  normal: "0.02em",
  /** Títulos e a maior parte da caixa-alta. */
  largo: "0.2em",
  /** Subtítulos "PALEONTOLOGIA E BIOMA" e "RANKING GERAL". */
  extra: "0.5em",
} as const;

/** Pesos da Futura PT como declarados em globals.css. */
export const PESO = {
  medium: 500,
  demi: 600,
  bold: 700,
  extraBold: 800,
  heavy: 900,
} as const;

export const medidasSala6 = {
  /** Casinha de VOLTAR / SAIR / MENU: ícone 67×63 com o rótulo 12px abaixo. */
  casa: { largura: 67, altura: 63, espaco: 12, texto: 26.1 },

  /** Cartão central bege das telas de diálogo (recomeçar, venceu, perdeu). */
  cartao: { x: 596, y: 144, largura: 728, altura: 756 },

  /** Botão retangular de 456×130 usado no menu e nos diálogos. */
  botao: { largura: 456, altura: 130, texto: 39.8 },

  /** Grades de carta. `passo` é a distância entre origens de duas cartas vizinhas. */
  tabuleiro: {
    facil: { colunas: 6, linhas: 3, carta: 228, passoX: 260.8, passoY: 260, topo: 225 },
    dificil: { colunas: 8, linhas: 4, carta: 181, passoX: 207, passoY: 206.3, topo: 211 },
  } satisfies Record<string, Grade>,

  /** Cabeçalho do tabuleiro: casinha à esquerda, título ao centro, relógio à direita. */
  cabecalhoJogo: {
    casa: { x: 90, y: 48 },
    titulo: { y: 61, texto: 65.1 },
    relogio: { x: 1507, y: 71, tamanho: 63, espaco: 39, texto: 48.7 },
  },
} as const;

export interface Grade {
  colunas: number;
  linhas: number;
  /** Lado da carta, quadrada nos dois níveis. */
  carta: number;
  passoX: number;
  passoY: number;
  /** Distância do topo da página até a primeira linha de cartas. */
  topo: number;
}
