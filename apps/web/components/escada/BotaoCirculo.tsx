import Image from "next/image";
import { cores } from "@/lib/escada/cores";

interface BotaoCirculoProps {
  icone: string;
  label: string;
  onClick: () => void;
  destaque?: boolean;
  claro?: boolean;
}

export function BotaoCirculo({ icone, label, onClick, destaque, claro }: BotaoCirculoProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-4 cursor-pointer">
      <span
        className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full"
        style={{ backgroundColor: destaque ? cores.botaoTan : "#DFDFDF" }}
      >
        <Image src={icone} alt="" width={56} height={56} className="h-14 w-14 sm:h-16 sm:w-16" />
      </span>
      <span
        className="text-[21.6px] sm:text-[24px] font-bold tracking-wide"
        style={{ color: claro ? cores.textoClaro : cores.textoEscuro }}
      >
        {label}
      </span>
    </button>
  );
}
