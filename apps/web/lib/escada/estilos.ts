import type { CSSProperties } from "react";
import { cores } from "@/lib/escada/cores";

// Tokens visuais do fluxo da Escada — canvas 1920×1080 do XD.
//
// Existem porque os valores tinham divergido entre telas feitas em sessões diferentes
// (logo a 11.53vw numa e 8.72vw noutra, título a 2.08vw com entreletra numa e 1.8vw sem
// noutra). A referência é a tela "Você optou por foto/vídeo" (TelaInformacoes), que é a
// que o Gabriel validou. Mudou aqui, muda em todas.

export const ESCADA = {
  /** Moldura padrão: tela cheia, fundo claro, respiro de 2.5vw. */
  tela: {
    backgroundColor: cores.fundoClaro,
    padding: "2.5vw",
  } as CSSProperties,

  /** Logo vertical no canto superior esquerdo. */
  logo: {
    largura: "11.53vw",
    posicao: { position: "absolute", left: "5.5vw", top: "calc(2.5vw + 2vh)" } as CSSProperties,
  },

  /** Ícone de vídeo/foto que encabeça as telas do miolo do fluxo. Era 6.79vw (+21%). */
  icone: "8.22vw",

  /**
   * Altura do topo do ícone de foto/vídeo, contada do topo da tela.
   *
   * Existe para que TelaOrigem e TelaAutorizacao — telas seguidas, onde o ícone é o
   * único elemento que não muda — não deem um pulinho na troca. A origem chega nesta
   * altura pelo fluxo (`tela.padding` + `conteudo.paddingTop`); a autorização, que
   * posiciona tudo por coordenada absoluta, precisa do valor escrito.
   *
   * **Tem que continuar igual à soma `tela.padding + conteudo.paddingTop`** — mexeu
   * num dos dois, mexe aqui.
   */
  iconeTopo: "calc(2.5vw + 1vh)",

  /** Bloco de conteúdo centralizado abaixo do topo. */
  conteudo: {
    gap: "1.25vw",
    // Era 8.33vh; reduzido para subir ícone, textos e campos na tela.
    paddingTop: "1vh",
  },

  /**
   * Recuo para telas em que o conteúdo ocupa a faixa esquerda (Captura, Preview, Texto)
   * e passaria por baixo da logo. A logo tem 11.53vw de largura e proporção 239×251,
   * ou seja 12.11vw de altura, começando em 2.5vw + 2vh. Somando a folga, o conteúdo
   * precisa começar em ~13.5vw + 2vh abaixo do padding do container.
   */
  recuoAbaixoDaLogo: "calc(13.5vw + 2vh)",

  // Escala tipográfica do PDF "Depoimentos (Tablet).pdf", medida página a página.
  // O arquivo trabalha com três tamanhos e quase nada fora deles:
  //   43,4px  texto corrido e títulos das telas de captura, preview e texto
  //   39,5px  títulos e chamadas das telas de formulário
  //   36–38px rótulos, botões, campos e navegação
  // Em vw sobre o canvas de 1920: 2,26vw · 2,06vw · 1,9vw.
  texto: {
    /** Título da tela: 1ª linha em bold, 2ª em medium. 39,5px no PDF. */
    titulo: { color: cores.textoEscuro, fontSize: "2.06vw", letterSpacing: "3.6px" } as CSSProperties,
    /** Chamada secundária, em marrom claro (ex: "Informações básicas (obrigatório)"). */
    secundario: { color: "#895C3B", fontSize: "2.06vw", letterSpacing: "3.7px" } as CSSProperties,
    /** Texto corrido das telas de instrução (captura, preview, texto). 43,4px. */
    corpo: { color: cores.textoEscuro, fontSize: "2.26vw" } as CSSProperties,
    /** Rótulos de botão e contadores. 37,7px. */
    rotulo: { color: cores.textoEscuro, fontSize: "1.96vw" } as CSSProperties,
    /** Apoio pequeno (legendas). */
    apoio: { color: cores.textoEscuro, fontSize: "1.05vw" } as CSSProperties,
  },

  /** ANTERIOR / PRÓXIMO: sempre na altura do meio da tela, nas bordas. */
  navegacao: {
    /** 36,5px no PDF. */
    tamanhoTexto: "1.9vw",
    /**
     * 61px. Os PNGs das setas são quadrados de 401×401 com a seta ocupando o miolo:
     * ~80% da altura e ~51% da largura. Numa caixa de 61 a seta sai com 31×49, que
     * é exatamente a medida do protótipo. Vinha em 1,5vw (29px), o que deixava a
     * seta com um terço do tamanho desenhado.
     */
    tamanhoIcone: "3.18vw",
    /**
     * Recuo das bordas da tela: 100px.
     *
     * O PDF põe as setas a 145px de cada borda (a da esquerda em x=145, a da direita
     * terminando em 1775), mas na tela real isso afasta demais os botões do conteúdo.
     * 100px é o meio-termo escolhido — bem mais folgado que os 32px de antes, sem
     * jogá-los para o miolo. É o único número a mexer para calibrar, e vale também
     * para o PRÓXIMO da tela de texto.
     */
    recuo: "5.21vw",
    /** Respiro entre a seta e a palavra. */
    espaco: "1.4vw",
  },

  /** Botões redondos de GRAVAR / PARAR / FOTO (p.9, 10 e 14 do protótipo). */
  botaoCaptura: { tamanho: "9.9vw", icone: "3.4vw" },

  /**
   * Barra cor de areia usada em campos e no seletor de país/estado.
   * `letterSpacing` fica aqui e não numa classe de placeholder: assim o valor digitado
   * e o placeholder recebem o mesmo espaçamento, que é o que o XD especifica (3,7px).
   */
  campo: {
    width: "43.07vw",
    maxWidth: "100%",
    height: "5.37vh",
    backgroundColor: "#E2B291",
    borderRadius: "0.21vw",
    color: cores.textoEscuro,
    // 36,5px no PDF (p.3, "Nome" e "E-mail"), não os 26px que estavam aqui.
    fontSize: "1.9vw",
    letterSpacing: "3.4px",
    padding: "0 1.5vw",
    outline: "none",
    /**
     * O valor digitado sai em Heavy, mais pesado que o Medium do protótipo.
     * É desvio pedido — no PDF valor e placeholder têm o mesmo peso, e na tela real
     * ficava difícil saber o que já foi preenchido. O placeholder continua Medium,
     * pela classe `placeholder:font-medium`, então os dois se distinguem.
     */
    fontWeight: 900,
  } as CSSProperties,

  /** Respiro entre os campos de nome e e-mail: 32px no PDF (607 − 517 − 58). */
  espacoEntreCampos: "1.67vw",

  /**
   * Na tela de origem os campos são bem mais estreitos que na de informações — no
   * PDF (p.5) medem 398px contra os 827px dos campos de nome/e-mail. Os rótulos
   * PAÍS e ESTADO saem em Demi 36,5px, e não em Bold.
   */
  origem: { rotulo: "8vw", espaco: "1.2vw", campo: "20.7vw" },
} as const;
