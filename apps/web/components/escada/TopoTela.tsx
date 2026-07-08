import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

export function TopoTela({ onSair }: { onSair?: () => void }) {
  return (
    <div className="flex w-full items-start justify-between">
      <Logo variante="escura" />
      {onSair && (
        <button onClick={onSair} className="flex flex-col items-center gap-1 cursor-pointer">
          <Image src="/icons/escada/cancelar.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-bold tracking-wide" style={{ color: cores.textoEscuro }}>
            SAIR
          </span>
        </button>
      )}
    </div>
  );
}
