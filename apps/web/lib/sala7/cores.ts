// Cores da Sala 7, amostradas nos JPEGs de design/sala7/ pela média de um retângulo
// (para cancelar o ruído do JPEG) ou pelo pixel extremo, no caso de texto — num
// traço fino antisserrilhado só os pixels do miolo têm a cor real.
export const coresSala7 = {
  /** Fundo da página, o mesmo bege claro da Escada. */
  fundo: "#FFEBE2",

  /** Marrom escuro da marca: título da galeria, textos do detalhe, botão de voltar. */
  texto: "#3D2A1A",

  /** Marrom médio do subtítulo da galeria ("O Museu do Sertão já recebeu..."). */
  textoSuave: "#775742",

  /** Cartela de convite e cabeçalho FILTRAR. */
  painel: "#8C5F3F",
  painelCabecalho: "#895C3B",

  /** Corpo do painel de filtro. */
  painelCorpo: "#E0A88C",

  /**
   * Texto claro sobre marrom/salmão: cartela de convite, itens do filtro, título do
   * recado. Vem do CSS do XD da cartela de convite — é quase o mesmo bege do fundo
   * da página, e não branco puro, o que a amostragem sozinha não distinguiria.
   */
  textoClaro: "#FFEBE1",

  /** Caixa do recado no detalhe, e o salmão do texto dentro dela. */
  recadoCaixa: "#5E280E",
  recadoTexto: "#DCA98E",

  /** Mão de "Prestigiar" apagada; acesa usa `painelCorpo`. */
  maoApagada: "#E4C2AA",

  /** Barra de progresso e volume do vídeo, desenhadas sobre a imagem. */
  videoCheio: "#E3B291",
  videoTrilho: "#724837",
} as const;
