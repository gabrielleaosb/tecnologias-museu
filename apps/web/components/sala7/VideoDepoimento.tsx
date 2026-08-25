"use client";

import { useEffect, useRef, useState } from "react";
import { coresSala7 } from "@/lib/sala7/cores";
import { detalhe, d } from "@/lib/sala7/medidas";

/**
 * Player do depoimento em vídeo, com os controles desenhados por nós.
 *
 * O protótipo não usa o player nativo do navegador: desenha volume no alto à
 * esquerda, um play grande no centro e a barra de progresso colada na base, tudo na
 * paleta da sala. `controls` nativo traria a barra cinza do Chromium, que além de
 * destoar muda de desenho conforme a versão — inaceitável numa tela de exposição.
 *
 * Sem botão de mudo: a barra de volume é o controle, e o toque nela já leva o som a
 * zero na ponta esquerda. Numa sala aberta, o visitante mexer no volume e não achar
 * como voltar é o risco maior.
 */
export function VideoDepoimento({ src }: { src: string }) {
  const referencia = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [volume, setVolume] = useState(1);

  // Cada depoimento reusa o mesmo elemento quando se navega com as setas; sem isto
  // o vídeo seguinte herdaria a posição e o estado de reprodução do anterior.
  useEffect(() => {
    setTocando(false);
    setProgresso(0);
  }, [src]);

  function alternar() {
    const video = referencia.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setTocando(true);
    } else {
      video.pause();
      setTocando(false);
    }
  }

  /** Converte o toque numa barra na fração correspondente, limitada a 0..1. */
  function fracaoDoToque(evento: React.MouseEvent<HTMLDivElement>) {
    const caixa = evento.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (evento.clientX - caixa.left) / caixa.width));
  }

  const { video: medidas } = detalhe;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={referencia}
        src={src}
        className="h-full w-full object-cover"
        onClick={alternar}
        onEnded={() => setTocando(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgresso(v.currentTime / v.duration);
        }}
      />

      <div
        className="absolute flex items-center"
        style={{ left: d(medidas.volume.x), top: d(medidas.volume.y), gap: d(medidas.volume.espaco) }}
      >
        <svg
          viewBox="0 0 36 27"
          style={{ width: d(medidas.volume.icone.largura), height: d(medidas.volume.icone.altura) }}
          fill={coresSala7.videoCheio}
          aria-hidden
        >
          <path d="M2 9.5h4.5L13 4v19L6.5 17.5H2z" />
          <path
            d="M18 10c2 2.5 2 4.5 0 7M23 6.5c4 5 4 9 0 14"
            fill="none"
            stroke={coresSala7.videoCheio}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>

        <div
          className="cursor-pointer"
          style={{
            width: d(medidas.volume.barra.largura),
            height: d(medidas.volume.barra.altura),
            backgroundColor: coresSala7.videoTrilho,
          }}
          onClick={(evento) => {
            const fracao = fracaoDoToque(evento);
            setVolume(fracao);
            if (referencia.current) referencia.current.volume = fracao;
          }}
        >
          <div style={{ width: `${volume * 100}%`, height: "100%", backgroundColor: coresSala7.videoCheio }} />
        </div>
      </div>

      {!tocando && (
        <button
          onClick={alternar}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ width: d(medidas.play.largura), height: d(medidas.play.altura) }}
          aria-label="Reproduzir"
        >
          <svg viewBox="0 0 90 111" className="h-full w-full" fill="rgba(255, 255, 255, 0.82)" aria-hidden>
            {/* Pontas levemente arredondadas, como no protótipo. */}
            <path d="M8 6.5 86 55.5 8 104.5Z" strokeLinejoin="round" stroke="rgba(255,255,255,0.82)" strokeWidth="12" />
          </svg>
        </button>
      )}

      <div
        className="absolute inset-x-0 bottom-0 cursor-pointer"
        style={{ height: d(medidas.progresso.altura), backgroundColor: coresSala7.videoTrilho }}
        onClick={(evento) => {
          const video = referencia.current;
          if (!video?.duration) return;
          const fracao = fracaoDoToque(evento);
          video.currentTime = fracao * video.duration;
          setProgresso(fracao);
        }}
      >
        <div style={{ width: `${progresso * 100}%`, height: "100%", backgroundColor: coresSala7.videoCheio }} />
      </div>
    </div>
  );
}
