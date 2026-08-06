import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";

// Canvas 1920×1080
// Logo: left=47px→2.45vw, top=52px→4.81vh

const LIMITE_CARACTERES = 150;

interface TelaTextoProps {
  tipo: "video" | "foto";
  texto: string;
  onTextoChange: (v: string) => void;
  onProximo: () => void;
  enviando: boolean;
  /** Mensagem de falha no envio; mantém o visitante na tela para tentar de novo. */
  erro?: string | null;
}

export function TelaTexto({ tipo, texto, onTextoChange, onProximo, enviando, erro }: TelaTextoProps) {
  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-start"
      style={{ ...ESCADA.tela, paddingTop: `calc(2.5vw + ${ESCADA.recuoAbaixoDaLogo})`, gap: "1.67vw" }}
    >
      <div style={ESCADA.logo.posicao}>
        <Logo variante="escura1-vertical" style={{ width: ESCADA.logo.largura }} />
      </div>

      <div style={{ paddingRight: "6.25vw" }}>
        <h1 style={ESCADA.texto.titulo}>
          <span className="block whitespace-nowrap font-bold">
            Para complementar {tipo === "video" ? "o vídeo" : "a foto"},
          </span>
          <span className="block whitespace-nowrap font-medium">você pode acrescentar um texto. (Opcional)</span>
        </h1>
      </div>

      <div className="flex flex-col items-end" style={{ gap: "0.42vw" }}>
        <textarea
          value={texto}
          maxLength={LIMITE_CARACTERES}
          onChange={(e) => onTextoChange(e.target.value)}
          placeholder="Escreva aqui, se quiser."
          rows={5}
          className="w-full resize-none rounded-md outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
          style={{
            backgroundColor: cores.botaoTan,
            color: cores.textoEscuro,
            fontSize: ESCADA.texto.corpo.fontSize,
            padding: "2vw",
          }}
        />
        <span style={ESCADA.texto.apoio}>
          {texto.length}/{LIMITE_CARACTERES} caracteres
        </span>
      </div>

      {erro && (
        <p className="font-bold" style={{ color: "#B3261E", fontSize: ESCADA.texto.corpo.fontSize }} role="alert">
          {erro}
        </p>
      )}

      <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ right: "2.5vw" }}>
        <button
          onClick={onProximo}
          disabled={enviando}
          className="pointer-events-auto flex items-center cursor-pointer disabled:opacity-40"
          style={{ gap: "0.42vw" }}
        >
          <span className="font-bold" style={ESCADA.texto.corpo}>
            {enviando ? "ENVIANDO..." : "PRÓXIMO"}
          </span>
          {!enviando && (
            <Image src="/icons/escada/seta2.png" alt="" width={24} height={24} style={{ width: ESCADA.navegacao.tamanhoIcone, height: ESCADA.navegacao.tamanhoIcone }} />
          )}
        </button>
      </div>
    </div>
  );
}
