import Image from "next/image";
import { cores } from "@/lib/escada/cores";

interface BotaoCirculoProps {
  icone: string;
  label: string;
  onClick: () => void;
  destaque?: boolean;
}

export function BotaoCirculo({ icone, label, onClick, destaque }: BotaoCirculoProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-4 cursor-pointer">
      <span
        className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full"
        style={{ backgroundColor: destaque ? cores.botaoTan : "#E5E0DC" }}
      >
        <Image src={icone} alt="" width={56} height={56} className="h-14 w-14 sm:h-16 sm:w-16" />
      </span>
      <span className="text-lg sm:text-xl font-bold tracking-wide" style={{ color: cores.textoEscuro }}>
        {label}
      </span>
    </button>
  );
}
