import { useState } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";

/**
 * Medidas de `design/escada/telapos.jpeg`, convertidas para o canvas 1920×1080.
 *
 * A tela repete a estrutura da captura que a antecede — logo horizontal e mídia nas
 * mesmas coordenadas —, o que faz a transição entre as duas parecer que só o conteúdo
 * da moldura mudou. Antes era uma grade de duas colunas centralizada, com o texto
 * alinhado à esquerda: nada coincidia com a tela anterior.
 */
const XD = {
  logo: { esquerda: "4.53vw", topo: "5.46vh", largura: "17.29vw" },
  midia: { esquerda: "3.9vw", topo: "24.63vh", largura: "51.04vw", proporcao: "16 / 9" },
  /** Ícone de expandir, no canto superior direito da mídia. */
  expandir: { recuo: "1.77vw", tamanho: "2.92vw" },
  /** Bloco de texto: centralizado em x=1506, começando em y=225. */
  texto: { esquerda: "60.18vw", largura: "36.46vw", topo: "20.83vh", corpo: "2.26vw", altura: 1.27 },
  /** Lista de ações: alinhada à esquerda em x=1279, uma linha a cada 95px. */
  acoes: { esquerda: "66.61vw", topo: "62.5vh", passo: "8.8vh", icone: "2.34vw", espaco: "1.4vw" },
} as const;

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
      <div
        className="flex h-screen w-screen flex-col items-center justify-center"
        style={{ backgroundColor: cores.fundoClaro, gap: "1.25vw", padding: "0.83vw" }}
      >
        {/*
          Sem logo sobreposta, ocupando a altura disponível.
          A logo por cima cobria justamente o rosto de quem acabou de se fotografar.
          A altura é fixada e a largura sai da proporção: só com `max-width` a mídia
          era desenhada no tamanho nativo da webcam — 640×480 aparecendo minúsculo num
          monitor de 1920. `object-contain` garante que ela nunca estique nem corte.
        */}
        <div className="flex items-center justify-center" style={{ maxWidth: "78vw" }}>
          {tipo === "video" ? (
            <video
              src={midiaUrl}
              controls
              autoPlay
              className="rounded-md"
              style={{ height: "78vh", width: "auto", maxWidth: "78vw", objectFit: "contain" }}
            />
          ) : (
            <img
              src={midiaUrl}
              alt="Foto capturada"
              className="rounded-md"
              style={{ height: "78vh", width: "auto", maxWidth: "78vw", objectFit: "contain" }}
            />
          )}
        </div>

        <button
          onClick={() => setTelaCheia(false)}
          className="flex cursor-pointer items-center"
          style={{ gap: ESCADA.navegacao.espaco }}
        >
          {/* Mesma seta do ANTERIOR: `seta2` espelhada, e não o ícone circular. */}
          <Image
            src="/icons/escada/seta2.png"
            alt=""
            width={401}
            height={401}
            style={{
              width: ESCADA.navegacao.tamanhoIcone,
              height: ESCADA.navegacao.tamanhoIcone,
              transform: "scaleX(-1)",
            }}
          />
          <span className="font-bold" style={ESCADA.texto.rotulo}>
            VOLTAR
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: cores.fundoClaro }}
    >
      <Logo
        variante="escura"
        style={{
          position: "absolute",
          left: XD.logo.esquerda,
          top: XD.logo.topo,
          width: XD.logo.largura,
        }}
      />

      <button
        onClick={() => setTelaCheia(true)}
        className="absolute cursor-pointer overflow-hidden rounded-md bg-black"
        style={{
          left: XD.midia.esquerda,
          top: XD.midia.topo,
          width: XD.midia.largura,
          aspectRatio: XD.midia.proporcao,
        }}
      >
        {tipo === "video" ? (
          <video src={midiaUrl} className="h-full w-full object-cover" />
        ) : (
          <img src={midiaUrl} alt="Foto capturada" className="h-full w-full object-cover" />
        )}

        {/*
          Ícone de expandir no canto da mídia, como na referência — é ele que abre a
          tela cheia, onde o vídeo toca com controles. Não veio como asset, então é
          desenhado aqui, e ganha um contorno escuro para não sumir sobre uma foto clara.
        */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="absolute"
          style={{
            right: XD.expandir.recuo,
            top: XD.expandir.recuo,
            width: XD.expandir.tamanho,
            height: XD.expandir.tamanho,
            fill: "none",
            stroke: "#FFFFFF",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.6))",
          }}
        >
          <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
        </svg>
      </button>

      {/* Título e parágrafo num bloco centralizado só, como na referência. */}
      <div
        className="absolute text-center"
        style={{
          left: XD.texto.esquerda,
          top: XD.texto.topo,
          width: XD.texto.largura,
          color: cores.textoEscuro,
          fontSize: XD.texto.corpo,
          lineHeight: XD.texto.altura,
        }}
      >
        <p className="font-bold">Agora falta pouco,</p>
        <p className="font-medium">
          {tipo === "video" ? (
            <>
              você pode assistir ao vídeo e, se preferir, descartar e gravar outro. Se gostou é
              só confirmar e seu vídeo já estará em exibição nos terminais.
            </>
          ) : (
            <>
              Essa é a foto que será exibida, se desejar descartá-la e tirar outra, clique em
              TIRAR OUTRA FOTO. Se estiver satisfeito, clique em CONFIRMAR. Para sair, clique
              em CANCELAR.
            </>
          )}
        </p>
      </div>

      <div className="absolute" style={{ left: XD.acoes.esquerda, top: XD.acoes.topo }}>
        {[
          { icone: "/icons/escada/confirmar.png", label: "CONFIRMAR", onClick: onConfirmar },
          {
            icone: "/icons/escada/refazer.png",
            label: tipo === "video" ? "REGRAVAR" : "TIRAR OUTRA FOTO",
            onClick: onRegravar,
          },
          {
            icone: "/icons/escada/cancelar.png",
            label: "CANCELAR",
            onClick: () => setConfirmandoCancelamento(true),
          },
        ].map(({ icone, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex cursor-pointer items-center"
            style={{ height: XD.acoes.passo, gap: XD.acoes.espaco }}
          >
            <Image
              src={icone}
              alt=""
              width={401}
              height={401}
              style={{ width: XD.acoes.icone, height: XD.acoes.icone }}
            />
            <span className="font-medium" style={ESCADA.texto.rotulo}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {confirmandoCancelamento && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: cores.overlayEscuro }}>
          <div className="flex flex-col items-center text-center" style={{ gap: "1.25vw" }}>
            <p className="font-bold text-white" style={{ maxWidth: "40vw", fontSize: ESCADA.texto.titulo.fontSize, letterSpacing: ESCADA.texto.titulo.letterSpacing }}>
              Tem certeza que deseja cancelar?
            </p>
            <p className="text-white font-medium" style={{ fontSize: ESCADA.texto.corpo.fontSize }}>O depoimento será excluído permanentemente.</p>
            <div className="flex" style={{ gap: "0.83vw" }}>
              <button
                onClick={onCancelar}
                className="rounded-md font-bold cursor-pointer"
                style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro, fontSize: ESCADA.texto.rotulo.fontSize, padding: "0.9vw 2.4vw" }}
              >
                SIM
              </button>
              <button
                onClick={() => setConfirmandoCancelamento(false)}
                className="rounded-md bg-white font-bold cursor-pointer"
                style={{ color: cores.textoEscuro, fontSize: ESCADA.texto.rotulo.fontSize, padding: "0.9vw 2.4vw" }}
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
