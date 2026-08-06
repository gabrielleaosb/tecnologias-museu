import { useEffect } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";
import { useCamera } from "@/lib/escada/useCamera";

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
        style={{ width: ESCADA.botaoCaptura.tamanho, height: ESCADA.botaoCaptura.tamanho, backgroundColor: cores.botaoTan }}
      >
        <Image src={icone} alt="" width={28} height={28} style={{ width: ESCADA.botaoCaptura.icone, height: ESCADA.botaoCaptura.icone }} />
      </span>
      <span className="font-bold" style={ESCADA.texto.corpo}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between" style={{ ...ESCADA.tela, gap: "1.67vw" }}>
      <div style={ESCADA.logo.posicao}>
        <Logo variante="escura1-vertical" style={{ width: ESCADA.logo.largura }} />
      </div>

      {/* A logo vertical é mais alta que a horizontal que estava aqui antes, então o
          conteúdo desce para não passar por baixo dela. */}
      <div className="grid grid-cols-2 items-center" style={{ gap: "2.08vw", paddingTop: ESCADA.recuoAbaixoDaLogo }}>
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
              <h1 className="font-bold" style={ESCADA.texto.titulo}>
                Posicione-se diante da câmera.
              </h1>
              <p className="font-medium" style={ESCADA.texto.corpo}>
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
                      style={{ width: ESCADA.botaoCaptura.tamanho, height: ESCADA.botaoCaptura.tamanho, backgroundColor: cores.botaoTan }}
                    >
                      <Image src="/icons/escada/gravando.png" alt="" width={28} height={28} style={{ width: ESCADA.botaoCaptura.icone, height: ESCADA.botaoCaptura.icone }} />
                    </span>
                    <span className="font-bold" style={ESCADA.texto.corpo}>
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
                  <span className="font-bold" style={ESCADA.texto.corpo}>
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
                <p className="mt-2" style={ESCADA.texto.apoio}>
                  Até 1 minuto de duração.
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-bold" style={ESCADA.texto.titulo}>
                Hora da foto!
              </h1>
              <p className="font-medium" style={ESCADA.texto.corpo}>
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

      {/* Aqui o ANTERIOR fica no rodapé, não na altura do meio como nas outras telas:
          a prévia da câmera ocupa a metade esquerda e o botão centralizado cairia em
          cima dela. É também o que o protótipo faz (p.9, 10 e 14). */}
      <Navegacao onAnterior={onAnterior} {...ESCADA.navegacao} />
    </div>
  );
}
