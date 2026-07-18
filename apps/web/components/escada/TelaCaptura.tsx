import { useEffect } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { useCamera } from "@/lib/escada/useCamera";

// Canvas 1920×1080. Botões círculo: 64px→3.33vw | ícones: 28px→1.46vw

const DURACAO_MAXIMA_VIDEO_S = 60;

interface TelaCapturaProps {
  tipo: "video" | "foto";
  onCapturado: (blob: Blob, url: string) => void;
  onAnterior: () => void;
}

export function TelaCaptura({ tipo, onCapturado, onAnterior }: TelaCapturaProps) {
  const camera = useCamera(tipo === "video" ? "video" : "foto");

  useEffect(() => {
    if (camera.midiaBlob && camera.midiaUrl) {
      onCapturado(camera.midiaBlob, camera.midiaUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.midiaBlob, camera.midiaUrl]);

  const segundosFormatado = String(camera.segundos).padStart(2, "0");

  const BotaoAcao = ({ icone, label, onClick, desabilitado = false }: { icone: string; label: string; onClick: () => void; desabilitado?: boolean }) => (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className="flex flex-col items-center cursor-pointer disabled:opacity-40"
      style={{ gap: "0.42vw" }}
    >
      <span
        className="flex items-center justify-center rounded-full"
        style={{ width: "3.33vw", height: "3.33vw", backgroundColor: cores.botaoTan }}
      >
        <Image src={icone} alt="" width={28} height={28} style={{ width: "1.46vw", height: "1.46vw" }} />
      </span>
      <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: "0.94vw" }}>
        {label}
      </span>
    </button>
  );

  return (
    <div
      className="flex h-screen w-screen flex-col"
      style={{ backgroundColor: cores.fundoClaro, padding: "2.5vw", gap: "1.67vw" }}
    >
      <Logo variante="escura" />

      <div className="grid flex-1 grid-cols-2 items-center" style={{ gap: "2.08vw" }}>
        <div className="relative w-full overflow-hidden rounded-md bg-black" style={{ aspectRatio: "16/9" }}>
          <video ref={camera.videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          {camera.contagemRegressiva !== null && (
            <div
              className="absolute right-4 top-4 flex items-center justify-center rounded-full bg-black/60 text-white"
              style={{ width: "2.92vw", height: "2.92vw", fontSize: "1.875vw" }}
            >
              {camera.contagemRegressiva}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center text-center" style={{ gap: "1.25vw" }}>
          {tipo === "video" ? (
            <>
              <h1 className="font-extrabold" style={{ color: cores.textoEscuro, fontSize: "1.5vw" }}>
                Posicione-se diante da câmera.
              </h1>
              <p style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
                A câmera começará a gravar 5 segundos após você apertar no botão <strong>GRAVAR</strong>. Quando
                terminar, aperte no botão <strong>PARAR</strong>.
              </p>

              <div className="flex items-center" style={{ gap: "2.08vw" }}>
                {!camera.gravando ? (
                  <BotaoAcao
                    icone="/icons/escada/play.png"
                    label="GRAVAR"
                    onClick={camera.iniciarGravacao}
                    desabilitado={!camera.streamPronto || camera.contagemRegressiva !== null}
                  />
                ) : (
                  <div className="flex flex-col items-center" style={{ gap: "0.42vw" }}>
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{ width: "3.33vw", height: "3.33vw", backgroundColor: cores.botaoTan }}
                    >
                      <Image src="/icons/escada/gravando.png" alt="" width={28} height={28} style={{ width: "1.46vw", height: "1.46vw" }} />
                    </span>
                    <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: "0.94vw" }}>
                      GRAVANDO...
                    </span>
                  </div>
                )}
                <BotaoAcao
                  icone="/icons/escada/pause.png"
                  label="PARAR"
                  onClick={camera.pararGravacao}
                  desabilitado={!camera.gravando}
                />
              </div>

              <div style={{ width: "16.67vw" }}>
                <div className="flex items-center" style={{ gap: "0.42vw" }}>
                  <Image src="/icons/escada/reloginho.png" alt="" width={20} height={20} style={{ width: "1.04vw", height: "1.04vw" }} />
                  <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
                    {segundosFormatado} segundos
                  </span>
                </div>
                <div className="mt-2 w-full rounded-full" style={{ height: "0.42vw", backgroundColor: cores.botaoTan }}>
                  <div
                    className="rounded-full"
                    style={{
                      height: "0.42vw",
                      backgroundColor: cores.textoEscuro,
                      width: `${Math.min(100, (camera.segundos / DURACAO_MAXIMA_VIDEO_S) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2" style={{ color: cores.textoEscuro, fontSize: "0.875vw" }}>
                  Até 1 minuto de duração.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-extrabold" style={{ color: cores.textoEscuro, fontSize: "1.5vw" }}>
                Hora da foto!
              </h1>
              <p style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
                Posicione-se diante da câmera e clique em <strong>FOTO</strong>. Após pressionar o botão, você terá 5
                segundos para se preparar.
              </p>
              <BotaoAcao
                icone="/icons/escada/fotografar.png"
                label="FOTO"
                onClick={camera.tirarFoto}
                desabilitado={!camera.streamPronto || camera.contagemRegressiva !== null}
              />
            </>
          )}

          {camera.erro && <p className="text-red-600">{camera.erro}</p>}
        </div>
      </div>

      <button onClick={onAnterior} className="flex items-center self-start cursor-pointer" style={{ gap: "0.42vw" }}>
        <Image src="/icons/escada/voltar1.png" alt="" width={20} height={20} style={{ width: "1.04vw", height: "1.04vw" }} />
        <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
          ANTERIOR
        </span>
      </button>
    </div>
  );
}
