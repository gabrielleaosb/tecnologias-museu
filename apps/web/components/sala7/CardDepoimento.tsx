import Image from "next/image";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";

export function CardDepoimento({ depoimento, onClick }: { depoimento: DepoimentoPublico; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative aspect-video w-full overflow-hidden rounded-md bg-black cursor-pointer">
      {depoimento.tipo === "video" ? (
        <video src={depoimento.arquivoUrl} muted preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <img src={depoimento.arquivoUrl} alt={depoimento.nome} className="h-full w-full object-cover" />
      )}
      <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
        <Image
          src={depoimento.tipo === "video" ? "/icons/escada/play.png" : "/icons/escada/foto.png"}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4"
        />
      </span>
      <span
        className="absolute inset-x-0 bottom-0 px-3 py-2 text-left text-sm font-bold text-white"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
      >
        {depoimento.nome.toUpperCase()}
      </span>
    </button>
  );
}
