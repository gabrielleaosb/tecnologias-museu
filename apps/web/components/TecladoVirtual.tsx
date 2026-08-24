"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Teclado on-screen embutido no app.
 *
 * Existe porque os dispositivos do museu são monitores touch sem teclado físico, e
 * depender do teclado nativo do sistema é uma aposta que só se confere em campo: em
 * Chromium modo kiosk o teclado do Windows não sobe sozinho sem o modo tablet
 * configurado, e um totem em que não dá para digitar o nome é um totem parado.
 * Sendo do app, funciona igual em qualquer SO e é testável daqui.
 *
 * Monta-se sozinho sobre qualquer campo de texto da página que receba foco — quem
 * usa não precisa ligar campo por campo, só renderizar o componente. Os campos
 * devem levar `inputMode="none"` para o teclado do sistema não abrir por cima.
 *
 * Restaurado de `components/escada/TecladoVirtual.tsx`, removido em 2026-08-06
 * (commit 4756a1e). Agora é compartilhado entre a Escada e a Sala 6.
 */

// Paleta neutra de teclado de sistema, deliberadamente fora da marca do museu: ele
// representa o teclado do aparelho, não a interface da exposição.
const COR_FUNDO = "#101014";
const COR_TECLA = "#2b2b33";
const COR_TEXTO = "#e7e7ea";
const COR_TEXTO_FRACO = "#8c8c96";

const LINHA_LETRAS_1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const LINHA_LETRAS_2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"];
const LINHA_LETRAS_3 = ["z", "x", "c", "v", "b", "n", "m", ",", "."];

const LINHA_NUMEROS_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const LINHA_NUMEROS_2 = ["@", "#", "$", "_", "&", "-", "+", "(", ")", "/"];
const LINHA_NUMEROS_3 = ["*", '"', "'", ":", ";", "!", "?"];

const ACENTOS = ["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú"];

/**
 * Escreve no campo pelo setter nativo, e não por `elemento.value = ...`.
 *
 * O React instala o próprio descritor em `value`; atribuir direto atualiza o DOM
 * sem que o React perceba, e no próximo render o valor antigo volta. Passando pelo
 * setter do protótipo e disparando `input`, o `onChange` do componente roda como se
 * a pessoa tivesse digitado — inclusive as transformações que ele aplique, como o
 * caixa-alta e o limite de caracteres da Sala 6.
 */
function setValorNativo(elemento: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const prototipo =
    elemento instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototipo, "value")?.set;
  setter?.call(elemento, valor);
  elemento.dispatchEvent(new Event("input", { bubbles: true }));
}

type Campo = HTMLInputElement | HTMLTextAreaElement;

/**
 * Onde está o cursor.
 *
 * `input[type=email]` (e number, entre outros) não expõe seleção: `selectionStart`
 * vem nulo e `setSelectionRange` lança. Nesses campos a escrita acontece sempre no
 * fim, que é o comportamento possível — e o certo para um campo de e-mail, digitado
 * da esquerda para a direita.
 */
function selecao(campo: Campo): { inicio: number; fim: number } {
  const inicio = campo.selectionStart;
  if (inicio === null) return { inicio: campo.value.length, fim: campo.value.length };
  return { inicio, fim: campo.selectionEnd ?? inicio };
}

/** Move o cursor, ignorando os campos que não suportam seleção (ver `selecao`). */
function posicionarCursor(campo: Campo, posicao: number) {
  campo.focus();
  try {
    campo.setSelectionRange(posicao, posicao);
  } catch {
    /* tipo de campo sem seleção: o cursor já fica no fim por conta do navegador */
  }
}

function ehCampoElegivel(elemento: Element | null): elemento is HTMLInputElement | HTMLTextAreaElement {
  if (!elemento) return false;
  if (elemento instanceof HTMLTextAreaElement) return true;
  if (elemento instanceof HTMLInputElement) {
    return elemento.type === "text" || elemento.type === "email";
  }
  return false;
}

type Pagina = "letras" | "numeros";

/**
 * Uma tecla.
 *
 * Fica fora do componente de propósito: definida dentro, o React trataria cada
 * render como um tipo novo e desmontaria e remontaria as quarenta teclas a cada
 * caractere digitado — desperdício que aparece justamente no mini PC do museu.
 *
 * `onMouseDown` cancelado preserva o foco do campo: sem isso o clique tira o foco
 * antes do `onClick`, o teclado se julga sem campo ativo e se fecha ao primeiro toque.
 */
function Tecla({
  children,
  onClick,
  largura,
  fraca = false,
}: {
  children: ReactNode;
  onClick: () => void;
  /** Em `em`, para acompanhar a escala do teclado. Ausente, a tecla divide o espaço. */
  largura?: number;
  fraca?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="cursor-pointer select-none text-center"
      style={{
        flex: largura ? `0 0 ${largura}em` : "1 1 0",
        padding: "0.55em 0",
        borderRadius: "0.3em",
        backgroundColor: COR_TECLA,
        color: fraca ? COR_TEXTO_FRACO : COR_TEXTO,
        touchAction: "manipulation",
        lineHeight: 1.2,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Respiro entre a base do campo em foco e o topo do teclado.
 *
 * Generoso porque campos costumam ter algo logo abaixo que também precisa aparecer
 * enquanto se digita — no depoimento da Escada é o contador de caracteres, que sem
 * esta folga fica encoberto justamente quando o visitante se aproxima do limite.
 */
const FOLGA_ACIMA_DO_TECLADO = 56;

/**
 * Base do elemento na página, somando a cadeia de `offsetParent`.
 *
 * Diferente de `getBoundingClientRect`, não enxerga `transform` — que é justamente
 * o que a tela usa para subir. Sem isso a medida realimentaria o próprio cálculo.
 */
function baseNoLayout(elemento: HTMLElement): number {
  let y = 0;
  let no: HTMLElement | null = elemento;
  while (no) {
    y += no.offsetTop;
    no = no.offsetParent as HTMLElement | null;
  }
  return y + elemento.offsetHeight;
}

/**
 * Geometria, igual em todas as telas que usam o teclado.
 *
 * Fica aqui e não em quem chama de propósito: a Escada e a Sala 6 medem as próprias
 * telas em unidades diferentes (vw/vh solto contra um canvas 16:9), e deixar a escala
 * a cargo de cada uma dava um teclado de tamanho diferente por tela. Como as duas
 * partem do mesmo canvas de projeto 1920×1080, a unidade abaixo — 1% da largura de
 * projeto, limitada pelos dois eixos — descreve as duas e entrega o mesmo teclado.
 */
const UNIDADE = "min(1vw, 1.7778vh)";
const emUnidades = (px: number) => `calc(${UNIDADE} * ${(px / 19.2).toFixed(4)})`;

const GEOMETRIA = {
  /** Escala das teclas: tudo lá dentro é medido em `em` a partir daqui. */
  escala: emUnidades(28),
  /**
   * Largura do teclado. Ele termina onde terminam as teclas — não é uma barra que
   * atravessa a tela. Esticadas na largura inteira as teclas ficariam largas e
   * baixas, e o dedo erra a fileira antes de errar a coluna.
   */
  largura: emUnidades(1314),
} as const;

interface TecladoVirtualProps {
  /**
   * Onde o teclado se prende. `tela` gruda na janela (Escada, que ocupa a tela toda);
   * `container` gruda no ancestral posicionado (Sala 6, cujo canvas 16:9 é
   * centralizado e deixaria o teclado fora de lugar se ele se prendesse à janela).
   */
  ancoragem?: "tela" | "container";
  /** Ajustes pontuais. A geometria vem de `GEOMETRIA` e não deve ser sobrescrita. */
  style?: CSSProperties;
  /**
   * Recebe quantos pixels a tela precisa subir para o campo em foco não ficar atrás
   * do teclado, e zero quando não precisa ou quando o teclado fecha.
   *
   * Quem decide subir é a tela, não o teclado: nas telas em que sobra espaço abaixo
   * do campo — a Sala 6, por exemplo — o valor é sempre zero e nada se move. Onde o
   * espaço não cabe, como no depoimento da Escada, a tela sobe **apenas enquanto se
   * digita** e volta ao lugar depois, de modo que o desenho em repouso continua sendo
   * exatamente o que foi validado contra o protótipo.
   */
  onDeslocar?: (pixels: number) => void;
}

export function TecladoVirtual({ ancoragem = "tela", style, onDeslocar }: TecladoVirtualProps) {
  const [campoAtivo, setCampoAtivo] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [pagina, setPagina] = useState<Pagina>("letras");
  const [maiuscula, setMaiuscula] = useState(true);
  const [mostrarAcentos, setMostrarAcentos] = useState(false);
  const tecladoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoFocar(evento: FocusEvent) {
      const alvo = evento.target as Element | null;
      if (ehCampoElegivel(alvo)) setCampoAtivo(alvo);
    }
    function aoDesfocar(evento: FocusEvent) {
      // Sair do campo para dentro do próprio teclado não conta como abandono.
      const destino = evento.relatedTarget as Node | null;
      if (destino && tecladoRef.current?.contains(destino)) return;
      setCampoAtivo(null);
    }
    document.addEventListener("focusin", aoFocar);
    document.addEventListener("focusout", aoDesfocar);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      document.removeEventListener("focusout", aoDesfocar);
    };
  }, []);

  // Mede depois de pintar, quando o teclado já tem altura. Roda também a cada troca
  // de página ou de fileira de acentos, porque as duas mudam a altura do teclado e
  // portanto o quanto a tela precisa subir.
  useEffect(() => {
    if (!onDeslocar) return;

    if (!campoAtivo || !tecladoRef.current) {
      onDeslocar(0);
      return;
    }

    // As duas medidas são de layout, e não de tela, de propósito: `getBoundingClientRect`
    // enxerga o deslocamento que este cálculo acabou de provocar, e recalcular a partir
    // dele — ao abrir os acentos, por exemplo — mediria a tela já erguida e devolveria um
    // valor menor, fazendo a tela descer de volta sobre o teclado. `offsetTop` e
    // `offsetHeight` ignoram `transform`, então a conta parte sempre do mesmo lugar.
    onDeslocar(
      Math.max(
        0,
        baseNoLayout(campoAtivo) + FOLGA_ACIMA_DO_TECLADO -
          (window.innerHeight - tecladoRef.current.offsetHeight)
      )
    );
  }, [campoAtivo, pagina, mostrarAcentos, onDeslocar]);

  if (!campoAtivo) return null;

  function digitar(caractere: string) {
    if (!campoAtivo) return;
    const texto = maiuscula ? caractere.toUpperCase() : caractere;
    const { inicio, fim } = selecao(campoAtivo);

    setValorNativo(campoAtivo, campoAtivo.value.slice(0, inicio) + texto + campoAtivo.value.slice(fim));
    posicionarCursor(campoAtivo, inicio + texto.length);
    setMostrarAcentos(false);
  }

  function apagar() {
    if (!campoAtivo) return;
    const { inicio, fim } = selecao(campoAtivo);

    // Com seleção, apaga a seleção; sem seleção, apaga o caractere anterior.
    const recorte = inicio === fim ? Math.max(0, inicio - 1) : inicio;
    if (recorte === fim) return;

    setValorNativo(campoAtivo, campoAtivo.value.slice(0, recorte) + campoAtivo.value.slice(fim));
    posicionarCursor(campoAtivo, recorte);
  }

  function moverCursor(delta: number) {
    if (!campoAtivo) return;
    const { inicio } = selecao(campoAtivo);
    posicionarCursor(campoAtivo, Math.max(0, Math.min(campoAtivo.value.length, inicio + delta)));
  }

  function fechar() {
    campoAtivo?.blur();
    setCampoAtivo(null);
    setPagina("letras");
    setMostrarAcentos(false);
  }

  const capitalizar = (c: string) => (maiuscula ? c.toUpperCase() : c);

  return (
    <div
      ref={tecladoRef}
      className="bottom-0 z-50 shadow-2xl"
      style={{
        position: ancoragem === "tela" ? "fixed" : "absolute",
        // Peça fechada e centralizada: acabaram as teclas, acabou o teclado.
        left: "50%",
        transform: "translateX(-50%)",
        width: GEOMETRIA.largura,
        maxWidth: "96%",
        backgroundColor: COR_FUNDO,
        padding: "0.5em",
        borderTopLeftRadius: "0.5em",
        borderTopRightRadius: "0.5em",
        fontSize: GEOMETRIA.escala,
        ...style,
      }}
    >
      <div className="flex flex-col" style={{ gap: "0.35em" }}>
      {mostrarAcentos && (
        <div className="flex" style={{ gap: "0.35em" }}>
          {ACENTOS.map((c) => (
            <Tecla key={c} onClick={() => digitar(c)}>
              {capitalizar(c)}
            </Tecla>
          ))}
        </div>
      )}

      {pagina === "letras" ? (
        <>
          <div className="flex" style={{ gap: "0.35em" }}>
            {LINHA_LETRAS_1.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {capitalizar(c)}
              </Tecla>
            ))}
            <Tecla largura={3.5} onClick={apagar}>
              ⌫
            </Tecla>
          </div>
          <div className="flex" style={{ gap: "0.35em", padding: "0 1.2em" }}>
            {LINHA_LETRAS_2.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {capitalizar(c)}
              </Tecla>
            ))}
          </div>
          <div className="flex" style={{ gap: "0.35em" }}>
            <Tecla largura={3} onClick={() => setMaiuscula((v) => !v)}>
              {maiuscula ? "⬆" : "⇧"}
            </Tecla>
            {LINHA_LETRAS_3.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {capitalizar(c)}
              </Tecla>
            ))}
            <Tecla largura={3} onClick={() => setMaiuscula((v) => !v)}>
              {maiuscula ? "⬆" : "⇧"}
            </Tecla>
          </div>
        </>
      ) : (
        <>
          <div className="flex" style={{ gap: "0.35em" }}>
            {LINHA_NUMEROS_1.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
            <Tecla largura={3.5} onClick={apagar}>
              ⌫
            </Tecla>
          </div>
          <div className="flex" style={{ gap: "0.35em" }}>
            {LINHA_NUMEROS_2.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
          </div>
          <div className="flex" style={{ gap: "0.35em", padding: "0 3em" }}>
            {LINHA_NUMEROS_3.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
          </div>
        </>
      )}

      <div className="flex" style={{ gap: "0.35em" }}>
        <Tecla largura={3.5} fraca onClick={() => setPagina((p) => (p === "letras" ? "numeros" : "letras"))}>
          {pagina === "letras" ? "?123" : "ABC"}
        </Tecla>
        <Tecla largura={3.5} fraca onClick={() => setMostrarAcentos((v) => !v)}>
          áçã
        </Tecla>
        <Tecla largura={3} fraca onClick={() => digitar("@")}>
          @
        </Tecla>
        <Tecla onClick={() => digitar(" ")}>espaço</Tecla>
        <Tecla largura={3} fraca onClick={() => moverCursor(-1)}>
          ‹
        </Tecla>
        <Tecla largura={3} fraca onClick={() => moverCursor(1)}>
          ›
        </Tecla>
        <Tecla largura={3.5} onClick={fechar}>
          ⌨
        </Tecla>
        </div>
      </div>
    </div>
  );
}
