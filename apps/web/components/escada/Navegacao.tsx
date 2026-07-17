import Image from "next/image";
import { cores } from "@/lib/escada/cores";

interface NavegacaoProps {
  onAnterior?: () => void;
  onProximo?: () => void;
  proximoHabilitado?: boolean;
  centralizado?: boolean;
  tamanhoTexto?: number;
  tamanhoIcone?: number;
}

export function Navegacao({
  onAnterior,
  onProximo,
  proximoHabilitado = true,
  centralizado = false,
  tamanhoTexto = 21.6,
  tamanhoIcone = 20,
}: NavegacaoProps) {
  const classeContainer = centralizado
    ? "pointer-events-none absolute inset-y-0 left-8 right-8 flex items-center justify-between sm:left-12 sm:right-12"
    : "flex w-full items-center justify-between";

  return (
    <div className={classeContainer}>
      {onAnterior ? (
        <button onClick={onAnterior} className="pointer-events-auto flex items-center gap-2 cursor-pointer">
          <Image
            src="/icons/escada/voltar1.png"
            alt=""
            width={tamanhoIcone}
            height={tamanhoIcone}
            style={{ width: tamanhoIcone, height: tamanhoIcone }}
          />
          <span className="font-bold tracking-wide" style={{ color: cores.textoEscuro, fontSize: tamanhoTexto }}>
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
          className="pointer-events-auto flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="font-bold tracking-wide" style={{ color: cores.textoEscuro, fontSize: tamanhoTexto }}>
            PRÓXIMO
          </span>
          <Image
            src="/icons/escada/seta2.png"
            alt=""
            width={tamanhoIcone}
            height={tamanhoIcone}
            style={{ width: tamanhoIcone, height: tamanhoIcone }}
          />
        </button>
      )}
    </div>
  );
}
