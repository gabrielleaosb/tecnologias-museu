import Image from "next/image";
import { cores } from "@/lib/escada/cores";

// ícone 28px/1920 = 1.46vw | texto 24px/1920 = 1.25vw

interface ItemAcaoProps {
  icone: string;
  label: string;
  onClick: () => void;
}

export function ItemAcao({ icone, label, onClick }: ItemAcaoProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-[0.63vw] cursor-pointer">
      <Image src={icone} alt="" width={28} height={28} style={{ width: "1.46vw", height: "1.46vw" }} />
      <span className="font-semibold" style={{ color: cores.textoEscuro, fontSize: "1.25vw" }}>
        {label}
      </span>
    </button>
  );
}
