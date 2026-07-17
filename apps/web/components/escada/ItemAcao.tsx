import Image from "next/image";
import { cores } from "@/lib/escada/cores";

interface ItemAcaoProps {
  icone: string;
  label: string;
  onClick: () => void;
}

export function ItemAcao({ icone, label, onClick }: ItemAcaoProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 cursor-pointer">
      <Image src={icone} alt="" width={28} height={28} className="h-6 w-6 sm:h-7 sm:w-7" />
      <span className="text-[21.6px] sm:text-[24px] font-semibold" style={{ color: cores.textoEscuro }}>
        {label}
      </span>
    </button>
  );
}
