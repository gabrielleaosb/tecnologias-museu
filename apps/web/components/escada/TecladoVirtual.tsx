"use client";

import { useEffect, useRef, useState } from "react";

// Paleta neutra do teclado do sistema (Android/Gboard), independente da marca do museu -
// referência visual: apps/web/design/escada/Depoimentos (Tablet).pdf
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

function setValorNativo(elemento: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const prototipo =
    elemento instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototipo, "value")?.set;
  setter?.call(elemento, valor);
  elemento.dispatchEvent(new Event("input", { bubbles: true }));
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

export function TecladoVirtual() {
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
      const relatedTarget = evento.relatedTarget as Node | null;
      if (relatedTarget && tecladoRef.current?.contains(relatedTarget)) return;
      setCampoAtivo(null);
    }
    document.addEventListener("focusin", aoFocar);
    document.addEventListener("focusout", aoDesfocar);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      document.removeEventListener("focusout", aoDesfocar);
    };
  }, []);

  if (!campoAtivo) return null;

  function digitar(caractere: string) {
    if (!campoAtivo) return;
    const texto = maiuscula ? caractere.toUpperCase() : caractere;
    const inicio = campoAtivo.selectionStart ?? campoAtivo.value.length;
    const fim = campoAtivo.selectionEnd ?? campoAtivo.value.length;
    const novoValor = campoAtivo.value.slice(0, inicio) + texto + campoAtivo.value.slice(fim);
    setValorNativo(campoAtivo, novoValor);
    campoAtivo.focus();
    campoAtivo.setSelectionRange(inicio + texto.length, inicio + texto.length);
    setMostrarAcentos(false);
  }

  function apagar() {
    if (!campoAtivo) return;
    const inicio = campoAtivo.selectionStart ?? campoAtivo.value.length;
    const fim = campoAtivo.selectionEnd ?? campoAtivo.value.length;
    if (inicio === fim && inicio > 0) {
      const novoValor = campoAtivo.value.slice(0, inicio - 1) + campoAtivo.value.slice(fim);
      setValorNativo(campoAtivo, novoValor);
      campoAtivo.focus();
      campoAtivo.setSelectionRange(inicio - 1, inicio - 1);
    } else if (inicio !== fim) {
      const novoValor = campoAtivo.value.slice(0, inicio) + campoAtivo.value.slice(fim);
      setValorNativo(campoAtivo, novoValor);
      campoAtivo.focus();
      campoAtivo.setSelectionRange(inicio, inicio);
    }
  }

  function moverCursor(delta: number) {
    if (!campoAtivo) return;
    const posicao = Math.max(0, Math.min(campoAtivo.value.length, (campoAtivo.selectionStart ?? 0) + delta));
    campoAtivo.focus();
    campoAtivo.setSelectionRange(posicao, posicao);
  }

  function fechar() {
    campoAtivo?.blur();
    setCampoAtivo(null);
    setPagina("letras");
    setMostrarAcentos(false);
  }

  function Tecla({
    children,
    onClick,
    largura = "flex-1",
    fraca = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    largura?: string;
    fraca?: boolean;
  }) {
    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`${largura} rounded-md py-3 text-center text-lg cursor-pointer select-none`}
        style={{ backgroundColor: COR_TECLA, color: fraca ? COR_TEXTO_FRACO : COR_TEXTO }}
      >
        {children}
      </button>
    );
  }

  return (
    <div ref={tecladoRef} className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-1.5 p-2.5 shadow-2xl" style={{ backgroundColor: COR_FUNDO }}>
      {mostrarAcentos && (
        <div className="flex gap-1.5">
          {ACENTOS.map((c) => (
            <Tecla key={c} onClick={() => digitar(c)}>
              {maiuscula ? c.toUpperCase() : c}
            </Tecla>
          ))}
        </div>
      )}

      {pagina === "letras" ? (
        <>
          <div className="flex gap-1.5">
            {LINHA_LETRAS_1.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {maiuscula ? c.toUpperCase() : c}
              </Tecla>
            ))}
            <Tecla largura="w-16" onClick={apagar}>
              ⌫
            </Tecla>
          </div>
          <div className="flex gap-1.5 px-4">
            {LINHA_LETRAS_2.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {maiuscula ? c.toUpperCase() : c}
              </Tecla>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Tecla largura="w-14" onClick={() => setMaiuscula((v) => !v)}>
              {maiuscula ? "⬆" : "⇧"}
            </Tecla>
            {LINHA_LETRAS_3.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {maiuscula ? c.toUpperCase() : c}
              </Tecla>
            ))}
            <Tecla largura="w-14" onClick={() => setMaiuscula((v) => !v)}>
              {maiuscula ? "⬆" : "⇧"}
            </Tecla>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-1.5">
            {LINHA_NUMEROS_1.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
            <Tecla largura="w-16" onClick={apagar}>
              ⌫
            </Tecla>
          </div>
          <div className="flex gap-1.5">
            {LINHA_NUMEROS_2.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
          </div>
          <div className="flex gap-1.5 px-10">
            {LINHA_NUMEROS_3.map((c) => (
              <Tecla key={c} onClick={() => digitar(c)}>
                {c}
              </Tecla>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-1.5">
        <Tecla largura="w-16" fraca onClick={() => setPagina((p) => (p === "letras" ? "numeros" : "letras"))}>
          {pagina === "letras" ? "?123" : "ABC"}
        </Tecla>
        <Tecla largura="w-16" fraca onClick={() => setMostrarAcentos((v) => !v)}>
          áçã
        </Tecla>
        <Tecla largura="w-14" fraca onClick={() => digitar("@")}>
          @
        </Tecla>
        <Tecla onClick={() => digitar(" ")}>espaço</Tecla>
        <Tecla largura="w-14" fraca onClick={() => moverCursor(-1)}>
          ‹
        </Tecla>
        <Tecla largura="w-14" fraca onClick={() => moverCursor(1)}>
          ›
        </Tecla>
        <Tecla largura="w-16" onClick={fechar}>
          ⌨
        </Tecla>
      </div>
    </div>
  );
}
