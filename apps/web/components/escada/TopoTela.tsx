import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

interface TopoTelaProps {
  onSair?: () => void;
  variante?: "clara" | "escura";
}

export function TopoTela({ onSair, variante = "escura" }: TopoTelaProps) {
  const corTexto = variante === "clara" ? cores.textoClaro : cores.textoEscuro;

  return (
    <div className="flex w-full items-start justify-between">
      <Logo variante={variante} />
      {onSair && (
        <button onClick={onSair} className="flex flex-col items-center gap-1 cursor-pointer">
          <Image
            src="/icons/escada/cancelar.png"
            alt=""
            width={24}
            height={24}
            className={`h-6 w-6 ${variante === "clara" ? "invert" : ""}`}
          />
          <span className="text-[16.8px] font-bold tracking-wide" style={{ color: corTexto }}>
            SAIR
          </span>
        </button>
      )}
    </div>
  );
}
