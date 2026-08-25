// Medidas da Sala 7, extraídas dos três JPEGs em design/sala7/ (galeria, detalhe de
// vídeo e detalhe de foto), que são capturas do protótipo num canvas de 1920×1080 —
// o mesmo das outras salas.
//
// ⚠️ A precisão aqui é menor que a da Sala 6, e é bom saber disso antes de discutir
// um pixel. Lá o material era um PDF vetorial e os números saíam dos objetos do
// arquivo; aqui são capturas de **847×474**, ou seja o canvas reduzido 2,27×. Cada
// pixel medido vale ~2,3px de projeto, e as bordas ainda chegam borradas pelo JPEG.
// Os números abaixo foram medidos por varredura de pixel e depois conferidos no
// navegador contra a imagem — valem ±5px de projeto, não mais que isso.

/**
 * Unidade da galeria: presa **só à largura**.
 *
 * A galeria rola verticalmente — no protótipo a terceira fileira de cards já entra
 * cortada pela borda de baixo — então ela não é uma composição fechada como as telas
 * da Sala 6. Prender a unidade também à altura encolheria os cards em qualquer tela
 * mais alta que 16:9, quando o certo é manter o tamanho e simplesmente caber menos
 * fileira por vez.
 */
export function g(px: number): string {
  return `${(px / PX_POR_UNIDADE).toFixed(4)}vw`;
}

/**
 * ⚠️ **Entreletra também passa por `g` / `d`**, e por isso é guardada abaixo como
 * número de px do canvas — nunca escrita como `"3.56px"` direto no estilo.
 *
 * Um valor fixo em px não acompanha o resto do desenho, que é medido em `vw`: quanto
 * menor a tela, maior a fatia da linha que o espaçamento come, e o texto arrebenta a
 * caixa. Foi exatamente esse o defeito corrigido no seletor de estado da Escada.
 */

/**
 * Unidade da tela de detalhe: limitada pelos **dois eixos**, como na Sala 6.
 *
 * Aqui é o contrário da galeria. O detalhe é uma composição fechada que precisa
 * caber inteira sem rolagem: mídia, recado, origem, nome e prestígio dividem uma
 * tela só. Em monitor fora de 16:9 sobra faixa, pintada com o fundo da página e
 * portanto invisível.
 */
export const UNIDADE_DETALHE = "min(1vw, 1.7778vh)";

export function d(px: number): string {
  return `calc(var(--u7) * ${(px / PX_POR_UNIDADE).toFixed(4)})`;
}

/** 1u = 1% da largura de projeto = 19,2px do canvas 1920. */
const PX_POR_UNIDADE = 19.2;

/** Pesos da Futura PT como declarados em globals.css. */
export const PESO = {
  book: 400,
  medium: 500,
  demi: 600,
  bold: 700,
  heavy: 900,
} as const;

export const galeria = {
  /**
   * Cartela marrom de convite, no alto à esquerda.
   *
   * O bloco de texto **não** é centrado na cartela nem tem recuo uniforme: o CSS do
   * XD põe a caixa de texto em (116, 119) com 340×175, o que dá 50 de folga à
   * esquerda contra 30 no alto. Por isso ele é posicionado por conta própria, e não
   * como `padding` da cartela.
   *
   * A entrelinha é 30,3, medida entre as linhas do protótipo — e não os 175/6 = 29,17
   * que a altura da caixa do XD sugeriria. Com 29,17 a quarta linha subia 6px; a caixa
   * do XD simplesmente tem folga sobrando embaixo.
   */
  convite: {
    x: 66,
    y: 89,
    largura: 442,
    altura: 237,
    raio: 18,
    texto: { x: 116, y: 119, largura: 340, altura: 175, corpo: 23, entrelinha: 30.3, tracking: 0.57 },
  },

  /**
   * Título e subtítulo são centrados na **tela inteira** (o texto medido fecha em
   * x=960), e não na faixa que sobra entre a cartela e a logo.
   *
   * Os corpos (55 e 32) vêm do XD; a entreletra foi derivada deles — com o corpo
   * fixo, o que falta para o trecho fechar a largura medida no protótipo só pode ser
   * espaçamento. As duas linhas do subtítulo devolveram 3,57 e 3,56px, e baterem em
   * 0,01px é o que confirma o corpo 32. Medir só a largura, sem o corpo do XD, tinha
   * me levado a um corpo maior sem espaçamento — mesma largura, desenho errado.
   */
  titulo: { y: 168, texto: 55, tracking: 6.4 },
  subtitulo: { y: 240, texto: 32, tracking: 3.56, entrelinha: 44, largura: 720 },

  /** Logo vertical escura, alinhada pela esquerda com o painel de filtro. */
  logo: { x: 1547, y: 61, largura: 243 },

  /**
   * Painel de filtro: flutua sobre a quarta coluna de cards, não empurra a grade.
   * O corpo não tem estado marcado no protótipo — os quatro itens saem iguais.
   */
  filtro: {
    x: 1566,
    y: 342,
    largura: 228,
    cabecalho: { altura: 57, texto: 29.3, tracking: 3.4 },
    item: { altura: 55, texto: 26 },
  },

  /**
   * Grade de cards: 4 colunas de 402×226 (16:9), calha de 24, margem de 120 nas duas
   * bordas. 120×2 + 402×4 + 24×3 = 1920, que é o que fecha a conta.
   */
  grade: { margem: 120, calha: 24, colunas: 4, card: { largura: 402, altura: 226 }, topo: 437 },

  /** Sobreposições do card: anel com o ícone no alto à esquerda, nome embaixo. */
  card: { anel: { tamanho: 57, recuo: 27, traco: 5 }, nome: { recuo: 32, base: 34, texto: 22.1, tracking: 0.88 } },
} as const;

export const detalhe = {
  /** Botão redondo de voltar, no alto à esquerda. O sinal branco mede 36×57. */
  voltar: { x: 86, y: 52, tamanho: 129, seta: { largura: 36, altura: 57 } },

  /** Logo horizontal, centrada na tela (a caixa do arquivo fecha em x=958,5). */
  logo: { x: 756, y: 37, largura: 405 },

  /** Mídia 16:9 à esquerda. */
  midia: { x: 132, y: 235, largura: 1142, altura: 642 },

  /**
   * Recado do visitante: caixa escura de altura fixa, o texto que passar é cortado —
   * o próprio protótipo mostra a última linha interrompida no meio da frase.
   *
   * O recuo de cima é menor que o dos lados porque o que se mede no arquivo é a
   * **tinta** da primeira linha, e acima dela a caixa de linha ainda soma entrelinha:
   * com 40 em cima, o título descia 9px além do protótipo.
   */
  recado: { x: 1312, y: 246, largura: 520, altura: 226, recuo: { topo: 30, lados: 40 }, titulo: 24.7, texto: 27.4, entrelinha: 41 },

  /**
   * Bloco "VEIO DE": alfinete à esquerda, três linhas à direita dele.
   *
   * As três linhas são centradas entre si em **x=1576** — medido nas três, que
   * fecharam em 1576/1576/1577 — e não centradas no espaço à direita do alfinete.
   * Por isso o bloco de texto tem coordenada própria, e não é um `flex` ao lado do
   * alfinete: seria o centro errado. O alfinete, por sua vez, fica na altura da
   * linha do meio.
   *
   * As três linhas saem no mesmo corpo (28,5); só "VEIO DE" muda de peso.
   *
   * ⚠️ A largura de 200 **não** sai do protótipo — ele traz só "ALAGOAS". Centrado em
   * 1576 sobram 85 até o alfinete, e um estado como "Rio Grande do Sul" atravessaria
   * o desenho. Com 200, ele quebra em duas linhas e nenhum nome de estado brasileiro
   * encosta no alfinete: a maior palavra isolada é "PERNAMBUCO", com ~194.
   */
  origem: {
    alfinete: { x: 1394, y: 631, largura: 97 },
    texto: { x: 1476, largura: 200, y: 588, corpo: 28.5, entrelinha: 57, tracking: 2.28 },
  },

  /** Nome e data, na faixa abaixo da mídia. Recuados das bordas dela. */
  rodapeMidia: { y: 905, recuo: 20, nome: 42.3, data: 24, tracking: 2.88 },

  /** Contador + mão + rótulo "Prestigiar", nesta ordem, com 24 de respiro. */
  prestigio: { x: 1464, y: 905, numero: 25, mao: 62, rotulo: 23.2, espaco: 24 },

  /** Setas de navegação: só o sinal, sem botão redondo, coladas nas bordas. */
  seta: { largura: 28, altura: 42, esquerda: 48, direita: 1820, y: 620 },

  /**
   * Controles do vídeo, desenhados sobre a mídia (o protótipo não usa o player
   * nativo). As coordenadas do volume são relativas ao canto da mídia, não à tela.
   *
   * O play é **só um triângulo translúcido**, sem disco atrás — foi preciso ampliar
   * o protótipo para ver que o que parecia um botão redondo é o triângulo sozinho.
   */
  video: {
    volume: { x: 27, y: 34, icone: { largura: 36, altura: 27 }, espaco: 18, barra: { largura: 75, altura: 21 } },
    progresso: { altura: 37 },
    play: { largura: 90, altura: 111 },
  },
} as const;
