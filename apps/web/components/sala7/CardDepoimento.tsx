import Image from "next/image";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";

export function CardDepoimento({ depoimento, onClick }: { depoimento: DepoimentoPublico; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-2 text-left cursor-pointer">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
        {depoimento.tipo === "video" ? (
          <video src={depoimento.arquivoUrl} muted preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <img src={depoimento.arquivoUrl} alt={depoimento.nome} className="h-full w-full object-cover" />
        )}
        <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
          <Image
            src={depoimento.tipo === "video" ? "/icons/escada/play.png" : "/icons/escada/foto.png"}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
        </span>
      </div>
      <span className="text-sm font-bold" style={{ color: coresSala7.texto }}>
        {depoimento.nome.toUpperCase()}
      </span>
    </button>
  );
}
