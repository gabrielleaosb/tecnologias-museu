"use client";

import { useEffect, useRef, useState } from "react";
import { cores } from "@/lib/escada/cores";

const LINHA_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const LINHA_2 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const LINHA_3 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"];
const LINHA_4 = ["z", "x", "c", "v", "b", "n", "m", "-", "_", "."];
const ACENTOS = ["á", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú"];

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

export function TecladoVirtual() {
  const [campoAtivo, setCampoAtivo] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [maiuscula, setMaiuscula] = useState(false);
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

  useEffect(() => {
    const conteudo = document.getElementById("escada-conteudo");
    if (!conteudo) return;
    conteudo.style.transition = "transform 0.2s ease";
    if (campoAtivo && tecladoRef.current) {
      conteudo.style.transform = `translateY(-${tecladoRef.current.offsetHeight}px)`;
    } else {
      conteudo.style.transform = "";
    }
  }, [campoAtivo, mostrarAcentos]);

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

  function fechar() {
    campoAtivo?.blur();
    setCampoAtivo(null);
  }

  function Tecla({ children, onClick, largura = "flex-1" }: { children: React.ReactNode; onClick: () => void; largura?: string }) {
    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`${largura} rounded-md py-3 text-center text-lg font-bold cursor-pointer select-none`}
        style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={tecladoRef}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-2 p-3 shadow-2xl"
      style={{ backgroundColor: cores.fundoEscuro }}
    >
      {mostrarAcentos && (
        <div className="flex gap-1.5">
          {ACENTOS.map((c) => (
            <Tecla key={c} onClick={() => digitar(c)}>
              {maiuscula ? c.toUpperCase() : c}
            </Tecla>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        {LINHA_1.map((c) => (
          <Tecla key={c} onClick={() => digitar(c)}>
            {c}
          </Tecla>
        ))}
      </div>
      <div className="flex gap-1.5">
        {LINHA_2.map((c) => (
          <Tecla key={c} onClick={() => digitar(c)}>
            {maiuscula ? c.toUpperCase() : c}
          </Tecla>
        ))}
      </div>
      <div className="flex gap-1.5">
        {LINHA_3.map((c) => (
          <Tecla key={c} onClick={() => digitar(c)}>
            {maiuscula ? c.toUpperCase() : c}
          </Tecla>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Tecla largura="w-20" onClick={() => setMaiuscula((v) => !v)}>
          {maiuscula ? "ABC" : "abc"}
        </Tecla>
        {LINHA_4.map((c) => (
          <Tecla key={c} onClick={() => digitar(c)}>
            {maiuscula ? c.toUpperCase() : c}
          </Tecla>
        ))}
        <Tecla largura="w-20" onClick={apagar}>
          ⌫
        </Tecla>
      </div>
      <div className="flex gap-1.5">
        <Tecla largura="w-24" onClick={() => setMostrarAcentos((v) => !v)}>
          á ã ç
        </Tecla>
        <Tecla onClick={() => digitar("@")} largura="w-16">
          @
        </Tecla>
        <Tecla onClick={() => digitar(" ")}>espaço</Tecla>
        <Tecla largura="w-28" onClick={fechar}>
          concluir
        </Tecla>
      </div>
    </div>
  );
}
