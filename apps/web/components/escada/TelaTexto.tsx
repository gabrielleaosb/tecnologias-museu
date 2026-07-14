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
    <div className="relative flex h-screen w-screen flex-col justify-center gap-8 p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="absolute left-8 top-8 sm:left-12 sm:top-12">
        <Logo variante="escura" />
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold sm:text-2xl" style={{ color: cores.textoEscuro }}>
          Para complementar {tipo === "video" ? "o vídeo" : "a foto"},
          <br />
          <span className="font-normal">você pode acrescentar um texto. (Opcional)</span>
        </h1>

        <button onClick={onProximo} disabled={enviando} className="flex items-center gap-2 cursor-pointer disabled:opacity-40">
          <span className="text-lg font-bold" style={{ color: cores.textoEscuro }}>
            {enviando ? "ENVIANDO..." : "PRÓXIMO"}
          </span>
          {!enviando && <Image src="/icons/escada/seta2.png" alt="" width={20} height={20} className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-col items-end gap-2">
        <textarea
          value={texto}
          maxLength={LIMITE_CARACTERES}
          onChange={(e) => onTextoChange(e.target.value)}
          placeholder="Escreva aqui, se quiser."
          rows={5}
          className="w-full resize-none rounded-md p-6 text-lg outline-none"
          style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
        />
        <span className="text-sm" style={{ color: cores.textoEscuro }}>
          {texto.length}/{LIMITE_CARACTERES} caracteres
        </span>
      </div>
    </div>
  );
}
