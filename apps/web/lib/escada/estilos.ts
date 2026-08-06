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

  texto: {
    /** Título da tela: 1ª linha em bold, 2ª em medium. */
    titulo: { color: cores.textoEscuro, fontSize: "2.08vw", letterSpacing: "4px" } as CSSProperties,
    /** Chamada secundária, em marrom claro (ex: "Informações básicas (obrigatório)"). */
    secundario: { color: "#895C3B", fontSize: "2.08vw", letterSpacing: "4px" } as CSSProperties,
    /** Texto corrido, campos, rótulos de botão. */
    corpo: { color: cores.textoEscuro, fontSize: "1.35vw" } as CSSProperties,
    /** Apoio pequeno (contadores, legendas). */
    apoio: { color: cores.textoEscuro, fontSize: "1.05vw" } as CSSProperties,
  },

  /** ANTERIOR / PRÓXIMO: sempre na altura do meio da tela, nas bordas. */
  navegacao: {
    tamanhoTexto: "1.35vw",
    tamanhoIcone: "1.25vw",
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
    fontSize: "1.35vw",
    letterSpacing: "3.7px",
    padding: "0 1.5vw",
    outline: "none",
  } as CSSProperties,

  /**
   * Na tela de origem os campos são bem mais estreitos que na de informações — no
   * protótipo (p.5/6) medem 301px de 1456, contra 627px dos campos de nome/e-mail.
   */
  origem: { rotulo: "8vw", espaco: "1.2vw", campo: "20.7vw" },
} as const;
