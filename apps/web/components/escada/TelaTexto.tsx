import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

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
      className="relative flex h-screen w-screen flex-col justify-start gap-8 p-8 pt-28 sm:p-12 sm:pt-32"
      style={{ backgroundColor: cores.fundoClaro }}
    >
      <div className="absolute left-[47px] top-[52px] sm:left-[63px] sm:top-[68px]">
        <Logo variante="escura1-vertical" />
      </div>
      <div className="pr-24 sm:pr-32">
        <h1 className="text-[28.8px] font-extrabold sm:text-[34.56px]" style={{ color: cores.textoEscuro }}>
          <span className="whitespace-nowrap">Para complementar {tipo === "video" ? "o vídeo" : "a foto"},</span>
          <br />
          <span className="whitespace-nowrap font-normal">você pode acrescentar um texto. (Opcional)</span>
        </h1>
      </div>

      <div className="flex flex-col items-end gap-2">
        <textarea
          value={texto}
          inputMode="none"
          maxLength={LIMITE_CARACTERES}
          onChange={(e) => onTextoChange(e.target.value)}
          placeholder="Escreva aqui, se quiser."
          rows={5}
          className="w-full resize-none rounded-md p-[38.4px] text-[25.92px] outline-none placeholder:font-medium placeholder:text-[37px] placeholder:tracking-[3.7px] placeholder:text-[#3D2A1A]"
          style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
        />
        <span className="text-[20.16px]" style={{ color: cores.textoEscuro }}>
          {texto.length}/{LIMITE_CARACTERES} caracteres
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center sm:right-12">
        <button
          onClick={onProximo}
          disabled={enviando}
          className="pointer-events-auto flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <span className="text-[25.92px] font-bold" style={{ color: cores.textoEscuro }}>
            {enviando ? "ENVIANDO..." : "PRÓXIMO"}
          </span>
          {!enviando && <Image src="/icons/escada/seta2.png" alt="" width={24} height={24} style={{ width: 24, height: 24 }} />}
        </button>
      </div>
    </div>
  );
}
