// Medidas do Admin extraídas do PDF "ADM - para analisar os depoimentos.pdf" (p.1),
// renderizado a 1456×816 e convertido para o canvas 1920×1080 do XD (fator 1,3187).
//
// A unidade `u` vale 1% da largura de projeto (19,2px em 1920). Diferente da Escada
// — que roda em kiosk numa resolução fixa e usa vw direto — o Admin abre em monitor
// de tamanho desconhecido, então tudo é escrito em `u` e só a definição de `u` muda.
//
// LISTA (/admin): a página cresce para baixo conforme o número de depoimentos, então
// rolagem vertical é normal e o que importa é caber na largura. `1cqw` é 1% da largura
// real do container — e não da viewport — o que evita o estouro horizontal que `vw`
// causava: `vw` inclui a barra de rolagem, então o conteúdo ficava alguns pixels mais
// largo que o espaço disponível e vazava para fora da tela.
export const UNIDADE_ADMIN = "1cqw";

// LOGIN: é uma composição fechada de 1920×1080 que precisa caber inteira, sem rolagem.
// Por isso a unidade é limitada pelos dois eixos (1920 de largura, 1080 de altura) e
// ainda satura em 19,2px, para não ampliar além do tamanho nativo em monitores 4K.
export const UNIDADE_ADMIN_TELA = "min(1vw, 1.7778vh, 19.2px)";

/** Converte um valor em `u` (1u = 1% de 1920px) para CSS. */
export function u(valor: number): string {
  return `calc(var(--u) * ${valor})`;
}

export const medidasAdmin = {
  larguraMaxima: "1920px",

  cabecalho: {
    padding: 8.2,
    titulo: 2.75,
    // Botões do topo reduzidos a 80% do tamanho do PDF (largura, altura e texto).
    botao: { altura: 3.24, texto: 1.43, espaco: 2.47 },
    larguraRelatorio: 12.69,
    larguraLogout: 9.89,
  },

  // Duas colunas: [mídia + nome + "Deletar tudo"] e [mensagem + "Deletar mensagem"].
  // Proporções da página 2 do PDF do ADM, que é onde o protótipo mostra justamente
  // este arranjo — mídia grande e os botões vermelhos embaixo de cada coluna.
  lista: {
    padding: 10.37,
    espacoVertical: 7.7,
    colunas: { midia: 48.2, mensagem: 27.9, acoes: 18.82 },
    espacoColunas: { midiaMensagem: 3.2 },
  },

  nome: { espacoAcima: 2.2, texto: 1.17, espacamento: 0.08 },

  mensagem: {
    // Na p.2 o card não centraliza pela mídia: começa 15% da altura dela abaixo do topo.
    deslocamentoTopo: 4.1,
    padding: 2.1,
    alturaMinima: 11.88,
    titulo: 1.03,
    corpo: 1.06,
    espacoTitulo: 0.7,
    espacamento: 0.08,
  },

  // "Deletar tudo" alinha à esquerda com a mídia; "Deletar mensagem" centraliza sob o card.
  acao: { altura: 3.37, texto: 1.72, espacoAposNome: 2.0, espacoAposMensagem: 3.4 },
} as const;
