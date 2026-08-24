// Paleta da Sala 6, amostrada dos objetos vetoriais do PDF "Jogo da memoria.pdf"
// (design/sala6/). Os valores vêm do preenchimento declarado nas formas, não de
// amostragem de pixel na página renderizada — a renderização mistura as camadas
// translúcidas e devolve cores que não existem no arquivo (ex: o #76492F da caixa
// de texto do menu é, na verdade, bege a 22% sobre o marrom do fundo).

export const coresSala6 = {
  /** Fundo do menu e da tela "recomeçar?"; texto escuro em quase tudo. */
  marrom: "#5E2A0E",
  /** Fundo da tela "você perdeu" e verso da carta no nível difícil. */
  marromEscuro: "#3A1809",
  /** Fundo do "novo jogo" e do "você venceu"; botão primário. */
  ocre: "#CE9146",
  /** Cartão central, botão secundário, texto sobre fundo escuro. */
  bege: "#CFB8A3",
  /** Mesa do tabuleiro fácil, botão SAIR do "recomeçar?", coluna fácil do ranking. */
  begeMedio: "#B2937D",
  /** Mesa do tabuleiro difícil e coluna difícil do ranking. */
  marromMedio: "#845C4C",
  /** Rótulos dos campos ("NOME DE JOGADOR", "NÍVEL") e título do ranking. */
  rotulo: "#89563F",
  branco: "#FFFFFF",
  /** Coroa do primeiro colocado no ranking. */
  coroa: "#FFB05A",

  /**
   * Camadas translúcidas. No XD são a cor cheia com opacidade; aqui viram rgba
   * porque o elemento tem texto dentro e `opacity` no CSS afetaria o texto junto.
   */
  /** Caixa do texto explicativo do menu: bege a 22% sobre o marrom. */
  caixaTexto: "rgba(207, 184, 163, 0.22)",
  /** Campos de nome e nível: marrom-rótulo a 21% sobre o bege do painel. */
  campo: "rgba(137, 86, 63, 0.21)",
  /** Marca-d'água da logo nas telas de fundo ocre. */
  marcaDagua: 0.6,
} as const;
