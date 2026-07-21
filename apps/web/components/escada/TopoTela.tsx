import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

// Ícone SAIR: 81px / 1920 = 4.22vw

interface TopoTelaProps {
  onSair?: () => void;
  variante?: "clara" | "escura";
  logoVariante?: "clara" | "escura" | "escura1-vertical" | "cinza-vertical";
  logoStyle?: React.CSSProperties;
  sairStyle?: React.CSSProperties;
}

export function TopoTela({ onSair, variante = "escura", logoVariante, logoStyle, sairStyle }: TopoTelaProps) {
  const corTexto = variante === "clara" ? cores.textoClaro : cores.textoEscuro;

  return (
    <div className="flex w-full items-start justify-between">
      <Logo variante={logoVariante ?? variante} style={logoStyle} />
      {onSair && (
        <button onClick={onSair} className="flex flex-col items-center gap-[0.5vh] cursor-pointer" style={sairStyle}>
          <Image
            src="/icons/escada/cancelar.png"
            alt=""
            width={81}
            height={81}
            className={variante === "clara" ? "invert" : ""}
            style={{ width: "4.22vw", height: "4.22vw" }}
          />
          <span
            className="font-bold tracking-[0.1em] text-center"
            style={{ color: corTexto, fontSize: "1.46vw", width: "4.22vw" }}
          >
            SAIR
          </span>
        </button>
      )}
    </div>
  );
}
