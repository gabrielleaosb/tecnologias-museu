import { useEffect } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { useCamera } from "@/lib/escada/useCamera";

interface TelaCapturaProps {
  tipo: "video" | "foto";
  onCapturado: (blob: Blob, url: string) => void;
  onAnterior: () => void;
}

const DURACAO_MAXIMA_VIDEO_S = 60;

export function TelaCaptura({ tipo, onCapturado, onAnterior }: TelaCapturaProps) {
  const camera = useCamera(tipo === "video" ? "video" : "foto");

  useEffect(() => {
    if (camera.midiaBlob && camera.midiaUrl) {
      onCapturado(camera.midiaBlob, camera.midiaUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.midiaBlob, camera.midiaUrl]);

  const segundosFormatado = String(camera.segundos).padStart(2, "0");

  return (
    <div className="flex h-screen w-screen flex-col gap-8 p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <Logo variante="escura" />
      <div className="grid flex-1 grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
          <video ref={camera.videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          {camera.contagemRegressiva !== null && (
            <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-[36px] text-white">
              {camera.contagemRegressiva}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          {tipo === "video" ? (
            <>
              <h1 className="text-[24px] font-extrabold sm:text-[28.8px]" style={{ color: cores.textoEscuro }}>
                Posicione-se diante da câmera.
              </h1>
              <p className="text-[21.6px]" style={{ color: cores.textoEscuro }}>
                A câmera começará a gravar 5 segundos após você apertar no botão <strong>GRAVAR</strong>. Quando
                terminar, aperte no botão <strong>PARAR</strong>.
              </p>

              <div className="flex items-center gap-10">
                {!camera.gravando ? (
                  <button
                    onClick={camera.iniciarGravacao}
                    disabled={!camera.streamPronto || camera.contagemRegressiva !== null}
                    className="flex flex-col items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                      <Image src="/icons/escada/play.png" alt="" width={28} height={28} className="h-7 w-7" />
                    </span>
                    <span className="font-bold" style={{ color: cores.textoEscuro }}>
                      GRAVAR
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                      <Image src="/icons/escada/gravando.png" alt="" width={28} height={28} className="h-7 w-7" />
                    </span>
                    <span className="font-bold" style={{ color: cores.textoEscuro }}>
                      GRAVANDO...
                    </span>
                  </div>
                )}

                <button
                  onClick={camera.pararGravacao}
                  disabled={!camera.gravando}
                  className="flex flex-col items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                    <Image src="/icons/escada/pause.png" alt="" width={28} height={28} className="h-7 w-7" />
                  </span>
                  <span className="font-bold" style={{ color: cores.textoEscuro }}>
                    PARAR
                  </span>
                </button>
              </div>

              <div className="w-full max-w-xs">
                <div className="flex items-center gap-2">
                  <Image src="/icons/escada/reloginho.png" alt="" width={20} height={20} className="h-5 w-5" />
                  <span className="text-[21.6px] font-bold" style={{ color: cores.textoEscuro }}>
                    {segundosFormatado} segundos
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: cores.textoEscuro,
                      width: `${Math.min(100, (camera.segundos / DURACAO_MAXIMA_VIDEO_S) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[16.8px]" style={{ color: cores.textoEscuro }}>
                  Até 1 minuto de duração.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[24px] font-extrabold sm:text-[28.8px]" style={{ color: cores.textoEscuro }}>
                Hora da foto!
              </h1>
              <p className="text-[21.6px]" style={{ color: cores.textoEscuro }}>
                Posicione-se diante da câmera e clique em <strong>FOTO</strong>. Após pressionar o botão, você terá 5
                segundos para se preparar.
              </p>

              <button
                onClick={camera.tirarFoto}
                disabled={!camera.streamPronto || camera.contagemRegressiva !== null}
                className="flex flex-col items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: cores.botaoTan }}>
                  <Image src="/icons/escada/fotografar.png" alt="" width={28} height={28} className="h-7 w-7" />
                </span>
                <span className="font-bold" style={{ color: cores.textoEscuro }}>
                  FOTO
                </span>
              </button>
            </>
          )}

          {camera.erro && <p className="text-red-600">{camera.erro}</p>}
        </div>
      </div>

      <button onClick={onAnterior} className="flex items-center gap-2 self-start cursor-pointer">
        <Image src="/icons/escada/voltar1.png" alt="" width={20} height={20} className="h-5 w-5" />
        <span className="text-[21.6px] font-bold" style={{ color: cores.textoEscuro }}>
          ANTERIOR
        </span>
      </button>
    </div>
  );
}
