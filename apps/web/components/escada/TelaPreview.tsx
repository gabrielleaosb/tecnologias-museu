import { useState } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

interface TelaPreviewProps {
  tipo: "video" | "foto";
  midiaUrl: string;
  onConfirmar: () => void;
  onRegravar: () => void;
  onCancelar: () => void;
}

export function TelaPreview({ tipo, midiaUrl, onConfirmar, onRegravar, onCancelar }: TelaPreviewProps) {
  const [telaCheia, setTelaCheia] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  if (telaCheia) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 p-4" style={{ backgroundColor: cores.fundoClaro }}>
        <div className="relative w-full max-w-4xl overflow-hidden rounded-md">
          {tipo === "video" ? (
            <video src={midiaUrl} controls autoPlay className="w-full" />
          ) : (
            <img src={midiaUrl} alt="Foto capturada" className="w-full" />
          )}
          <div className="absolute left-4 top-4">
            <Logo variante="clara" />
          </div>
        </div>
        <button onClick={() => setTelaCheia(false)} className="flex items-center gap-2 cursor-pointer">
          <Image src="/icons/escada/voltar1.png" alt="" width={20} height={20} className="h-5 w-5" />
          <span className="text-[21.6px] font-bold" style={{ color: cores.textoEscuro }}>
            VOLTAR
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center gap-12 p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="absolute left-8 top-8 sm:left-12 sm:top-12">
        <Logo variante="escura" />
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <button onClick={() => setTelaCheia(true)} className="relative aspect-video w-full overflow-hidden rounded-md bg-black cursor-pointer">
          {tipo === "video" ? (
            <video src={midiaUrl} className="h-full w-full object-cover opacity-70" />
          ) : (
            <img src={midiaUrl} alt="Foto capturada" className="h-full w-full object-cover" />
          )}
          {tipo === "video" && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                <Image src="/icons/escada/play.png" alt="" width={28} height={28} className="h-7 w-7" />
              </span>
              <span className="font-bold text-white">ASSISTIR</span>
            </span>
          )}
        </button>

        <div className="flex flex-col gap-6 text-center sm:text-left">
          <h1 className="text-[24px] font-extrabold sm:text-[28.8px]" style={{ color: cores.textoEscuro }}>
            Agora falta pouco,
          </h1>
          <p className="text-[21.6px]" style={{ color: cores.textoEscuro }}>
            {tipo === "video" ? (
              <>
                você pode assistir ao vídeo e, se preferir, descartar e gravar outro. Se gostou é só confirmar e seu
                vídeo já estará em exibição nos terminais.
              </>
            ) : (
              <>
                Essa é a foto que será exibida, se desejar descartá-la e tirar outra, clique em{" "}
                <strong>TIRAR OUTRA FOTO</strong>. Se estiver satisfeito, clique em <strong>CONFIRMAR</strong>. Para
                sair, clique em <strong>CANCELAR</strong>.
              </>
            )}
          </p>

          <div className="flex flex-col gap-4">
            <button onClick={onConfirmar} className="flex items-center gap-3 cursor-pointer">
              <Image src="/icons/escada/confirmar.png" alt="" width={26} height={26} className="h-6 w-6" />
              <span className="text-[21.6px] font-semibold" style={{ color: cores.textoEscuro }}>
                CONFIRMAR
              </span>
            </button>
            <button onClick={onRegravar} className="flex items-center gap-3 cursor-pointer">
              <Image src="/icons/escada/refazer.png" alt="" width={26} height={26} className="h-6 w-6" />
              <span className="text-[21.6px] font-semibold" style={{ color: cores.textoEscuro }}>
                {tipo === "video" ? "REGRAVAR" : "TIRAR OUTRA FOTO"}
              </span>
            </button>
            <button onClick={() => setConfirmandoCancelamento(true)} className="flex items-center gap-3 cursor-pointer">
              <Image src="/icons/escada/cancelar.png" alt="" width={26} height={26} className="h-6 w-6" />
              <span className="text-[21.6px] font-semibold" style={{ color: cores.textoEscuro }}>
                CANCELAR
              </span>
            </button>
          </div>
        </div>
      </div>

      {confirmandoCancelamento && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: cores.overlayEscuro }}>
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="max-w-md text-[24px] font-bold text-white">Tem certeza que deseja cancelar?</p>
            <p className="max-w-md text-white">O depoimento será excluído permanentemente.</p>
            <div className="flex gap-4">
              <button
                onClick={onCancelar}
                className="rounded-md px-8 py-3 text-[21.6px] font-bold cursor-pointer"
                style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
              >
                SIM
              </button>
              <button
                onClick={() => setConfirmandoCancelamento(false)}
                className="rounded-md bg-white px-8 py-3 text-[21.6px] font-bold cursor-pointer"
                style={{ color: cores.textoEscuro }}
              >
                NÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
