import Image from "next/image";
import { cores } from "@/lib/escada/cores";

interface NavegacaoProps {
  onAnterior?: () => void;
  onProximo?: () => void;
  proximoHabilitado?: boolean;
}

export function Navegacao({ onAnterior, onProximo, proximoHabilitado = true }: NavegacaoProps) {
  return (
    <div className="flex w-full items-center justify-between">
      {onAnterior ? (
        <button onClick={onAnterior} className="flex items-center gap-2 cursor-pointer">
          <Image src="/icons/escada/voltar1.png" alt="" width={20} height={20} className="h-5 w-5" />
          <span className="text-lg font-bold tracking-wide" style={{ color: cores.textoEscuro }}>
            ANTERIOR
          </span>
        </button>
      ) : (
        <span />
      )}

      {onProximo && (
        <button
          onClick={onProximo}
          disabled={!proximoHabilitado}
          className="flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-bold tracking-wide" style={{ color: cores.textoEscuro }}>
            PRÓXIMO
          </span>
          <Image src="/icons/escada/seta2.png" alt="" width={20} height={20} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
