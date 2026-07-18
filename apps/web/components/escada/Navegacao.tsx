import Image from "next/image";
import { cores } from "@/lib/escada/cores";

// Tamanhos padrão em vw (canvas 1920px): texto 21.6px→1.125vw, ícone 20px→1.04vw

interface NavegacaoProps {
  onAnterior?: () => void;
  onProximo?: () => void;
  proximoHabilitado?: boolean;
  centralizado?: boolean;
  tamanhoTexto?: string;
  tamanhoIcone?: string;
}

export function Navegacao({
  onAnterior,
  onProximo,
  proximoHabilitado = true,
  centralizado = false,
  tamanhoTexto = "1.125vw",
  tamanhoIcone = "1.04vw",
}: NavegacaoProps) {
  const classeContainer = centralizado
    ? "pointer-events-none absolute inset-y-0 left-[1.67vw] right-[1.67vw] flex items-center justify-between"
    : "flex w-full items-center justify-between";

  return (
    <div className={classeContainer}>
      {onAnterior ? (
        <button onClick={onAnterior} className="pointer-events-auto flex items-center gap-[0.42vw] cursor-pointer">
          <Image
            src="/icons/escada/voltar1.png"
            alt=""
            width={20}
            height={20}
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
          className="pointer-events-auto flex items-center gap-[0.42vw] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="font-bold tracking-wide" style={{ color: cores.textoEscuro, fontSize: tamanhoTexto }}>
            PRÓXIMO
          </span>
          <Image
            src="/icons/escada/seta2.png"
            alt=""
            width={20}
            height={20}
            style={{ width: tamanhoIcone, height: tamanhoIcone }}
          />
        </button>
      )}
    </div>
  );
}
