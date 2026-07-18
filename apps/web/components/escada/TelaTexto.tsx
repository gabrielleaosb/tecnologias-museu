import Image from "next/image";
import { cores } from "@/lib/escada/cores";
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
}

export function TelaTexto({ tipo, texto, onTextoChange, onProximo, enviando }: TelaTextoProps) {
  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-start"
      style={{ backgroundColor: cores.fundoClaro, padding: "2.5vw", paddingTop: "11.11vh", gap: "1.67vw" }}
    >
      <div style={{ position: "absolute", left: "2.45vw", top: "4.81vh" }}>
        <Logo variante="escura1-vertical" />
      </div>

      <div style={{ paddingRight: "6.25vw" }}>
        <h1 className="font-extrabold" style={{ color: cores.textoEscuro, fontSize: "1.8vw" }}>
          <span className="block whitespace-nowrap">Para complementar {tipo === "video" ? "o vídeo" : "a foto"},</span>
          <span className="block whitespace-nowrap font-normal">você pode acrescentar um texto. (Opcional)</span>
        </h1>
      </div>

      <div className="flex flex-col items-end" style={{ gap: "0.42vw" }}>
        <textarea
          value={texto}
          inputMode="none"
          maxLength={LIMITE_CARACTERES}
          onChange={(e) => onTextoChange(e.target.value)}
          placeholder="Escreva aqui, se quiser."
          rows={5}
          className="w-full resize-none rounded-md outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
          style={{
            backgroundColor: cores.botaoTan,
            color: cores.textoEscuro,
            fontSize: "1.35vw",
            padding: "2vw",
          }}
        />
        <span style={{ color: cores.textoEscuro, fontSize: "1.05vw" }}>
          {texto.length}/{LIMITE_CARACTERES} caracteres
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 flex items-center" style={{ right: "2.5vw" }}>
        <button
          onClick={onProximo}
          disabled={enviando}
          className="pointer-events-auto flex items-center cursor-pointer disabled:opacity-40"
          style={{ gap: "0.42vw" }}
        >
          <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: "1.35vw" }}>
            {enviando ? "ENVIANDO..." : "PRÓXIMO"}
          </span>
          {!enviando && (
            <Image src="/icons/escada/seta2.png" alt="" width={24} height={24} style={{ width: "1.25vw", height: "1.25vw" }} />
          )}
        </button>
      </div>
    </div>
  );
}
