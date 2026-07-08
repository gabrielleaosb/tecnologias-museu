import Image from "next/image";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";
import { Logo } from "@/components/escada/Logo";

interface TelaDetalheProps {
  depoimento: DepoimentoPublico;
  jaPrestigiou: boolean;
  onVoltar: () => void;
  onAnterior: () => void;
  onProximo: () => void;
  onPrestigiar: () => void;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function TelaDetalhe({ depoimento, jaPrestigiou, onVoltar, onAnterior, onProximo, onPrestigiar }: TelaDetalheProps) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center gap-4 p-8" style={{ backgroundColor: coresSala7.fundo }}>
      <button onClick={onAnterior} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black/10 cursor-pointer">
        <Image src="/icons/escada/seta1.png" alt="Anterior" width={20} height={20} className="h-5 w-5" />
      </button>

      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <button onClick={onVoltar} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/10 cursor-pointer">
            <Image src="/icons/escada/voltar1.png" alt="Voltar" width={20} height={20} className="h-5 w-5" />
          </button>
          <Logo variante="escura" />
          <span className="w-12" />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            {depoimento.tipo === "video" ? (
              <video src={depoimento.arquivoUrl} controls className="h-full w-full object-cover" />
            ) : (
              <img src={depoimento.arquivoUrl} alt={depoimento.nome} className="h-full w-full object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-md p-4" style={{ backgroundColor: coresSala7.detalheCaixa }}>
              <p className="text-xs font-bold text-white">DEIXOU ESTA MENSAGEM:</p>
              <p className="mt-1 text-sm text-white/90">{depoimento.texto ?? "(sem mensagem)"}</p>
            </div>

            <div className="flex items-center gap-3">
              <Image src="/icons/escada/local.png" alt="" width={24} height={24} className="h-6 w-6" />
              <div>
                <p className="text-xs font-bold" style={{ color: coresSala7.texto }}>
                  VEIO DE
                </p>
                <p className="font-semibold" style={{ color: coresSala7.texto }}>
                  {depoimento.estado.toUpperCase()}
                </p>
                <p className="text-sm" style={{ color: coresSala7.texto }}>
                  {depoimento.pais.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold" style={{ color: coresSala7.texto }}>
                  {depoimento.nome}
                </p>
                <p className="text-sm" style={{ color: coresSala7.texto }}>
                  {formatarData(depoimento.criadoEm)}
                </p>
              </div>

              <button onClick={onPrestigiar} disabled={jaPrestigiou} className="flex flex-col items-center gap-1 cursor-pointer disabled:opacity-60">
                <span className="text-sm font-bold" style={{ color: coresSala7.texto }}>
                  {depoimento.prestigios}
                </span>
                <Image
                  src={jaPrestigiou ? "/icons/escada/prestigiar-aceso.png" : "/icons/escada/prestigiar-apagado.png"}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
                <span className="text-xs" style={{ color: coresSala7.texto }}>
                  Prestigiar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={onProximo} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black/10 cursor-pointer">
        <Image src="/icons/escada/seta2.png" alt="Próximo" width={20} height={20} className="h-5 w-5" />
      </button>
    </div>
  );
}
