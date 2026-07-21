import Image from "next/image";
import { cores } from "@/lib/escada/cores";

// Círculo: 384px / 1920 = 20vw
// Ícone vídeo: 260px / 1920 = 13.54vw
// Ícone foto:  270×220px → 14.06vw × 11.46vw

interface BotaoCirculoProps {
  icone: string;
  label: string;
  onClick: () => void;
  destaque?: boolean;
  claro?: boolean;
  iconWidthVw?: number;
  iconHeightVw?: number;
}

export function BotaoCirculo({ icone, label, onClick, destaque, claro, iconWidthVw = 13.54, iconHeightVw = 13.54 }: BotaoCirculoProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[1.5vh] cursor-pointer">
      <span
        className="flex items-center justify-center rounded-full"
        style={{ width: "18.7vw", height: "18.7vw", backgroundColor: destaque ? cores.botaoTan : "#E0E0E0" }}
      >
        <Image
          src={icone}
          alt=""
          width={260}
          height={260}
          style={{ width: `${iconWidthVw}vw`, height: `${iconHeightVw}vw`, objectFit: "contain" }}
        />
      </span>
      <span
        className="font-bold tracking-widest"
        style={{ color: claro ? cores.textoClaro : cores.textoEscuro, fontSize: "1.88vw" }}
      >
        {label}
      </span>
    </button>
  );
}
