import { useState } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";

// Canvas 1920×1080

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
        <div className="relative w-full overflow-hidden rounded-md" style={{ maxWidth: "46.67vw" }}>
          {tipo === "video" ? (
            <video src={midiaUrl} controls autoPlay className="w-full" />
          ) : (
            <img src={midiaUrl} alt="Foto capturada" className="w-full" />
          )}
          <div className="absolute left-4 top-4">
            <Logo variante="clara" />
          </div>
        </div>
        <button onClick={() => setTelaCheia(false)} className="flex items-center cursor-pointer" style={{ gap: "0.42vw" }}>
          <Image src="/icons/escada/voltar1.png" alt="" width={20} height={20} style={{ width: "1.04vw", height: "1.04vw" }} />
          <span className="font-bold" style={ESCADA.texto.rotulo}>VOLTAR</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center"
      style={{ ...ESCADA.tela, gap: "2.5vw" }}
    >
      <div style={ESCADA.logo.posicao}>
        <Logo variante="escura1-vertical" style={{ width: ESCADA.logo.largura }} />
      </div>

      {/*
        Largura tirada da p.15 do PDF, onde a coluna de texto mede 722px (x=1138 a
        1860) — 37,6vw. Com os 53,33vw que estavam aqui cada coluna ficava com ~490px,
        e o mesmo parágrafo quebrava em quase o dobro de linhas: a coluna crescia para
        baixo e os botões CANCELAR e TIRAR OUTRA FOTO saíam pela borda da tela.
      */}
      <div
        className="grid w-full grid-cols-2 items-center"
        style={{ maxWidth: "77.3vw", gap: "2.08vw", marginTop: ESCADA.recuoAbaixoDaLogo }}
      >
        <button
          onClick={() => setTelaCheia(true)}
          className="relative w-full overflow-hidden rounded-md bg-black cursor-pointer"
          style={{ aspectRatio: "16/9" }}
        >
          {tipo === "video" ? (
            <video src={midiaUrl} className="h-full w-full object-cover opacity-70" />
          ) : (
            <img src={midiaUrl} alt="Foto capturada" className="h-full w-full object-cover" />
          )}
          {tipo === "video" && (
            <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: "0.42vw" }}>
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: "3.33vw", height: "3.33vw", backgroundColor: cores.botaoTan }}
              >
                <Image src="/icons/escada/play.png" alt="" width={28} height={28} style={{ width: "1.46vw", height: "1.46vw" }} />
              </span>
              <span className="font-bold text-white" style={{ fontSize: ESCADA.texto.rotulo.fontSize }}>ASSISTIR</span>
            </span>
          )}
        </button>

        <div className="flex flex-col" style={{ gap: "1.25vw" }}>
          <h1 className="font-bold" style={ESCADA.texto.titulo}>
            Agora falta pouco,
          </h1>
          <p className="font-medium" style={ESCADA.texto.corpo}>
            {tipo === "video" ? (
              <>você pode assistir ao vídeo e, se preferir, descartar e gravar outro. Se gostou é só confirmar e seu vídeo já estará em exibição nos terminais.</>
            ) : (
              <>Essa é a foto que será exibida, se desejar descartá-la e tirar outra, clique em <strong>TIRAR OUTRA FOTO</strong>. Se estiver satisfeito, clique em <strong>CONFIRMAR</strong>. Para sair, clique em <strong>CANCELAR</strong>.</>
            )}
          </p>

          <div className="flex flex-col" style={{ gap: "0.83vw" }}>
            {[
              { icone: "/icons/escada/confirmar.png", label: "CONFIRMAR", onClick: onConfirmar },
              { icone: "/icons/escada/refazer.png", label: tipo === "video" ? "REGRAVAR" : "TIRAR OUTRA FOTO", onClick: onRegravar },
              { icone: "/icons/escada/cancelar.png", label: "CANCELAR", onClick: () => setConfirmandoCancelamento(true) },
            ].map(({ icone, label, onClick }) => (
              <button key={label} onClick={onClick} className="flex items-center cursor-pointer" style={{ gap: "0.63vw" }}>
                <Image src={icone} alt="" width={26} height={26} style={{ width: "1.35vw", height: "1.35vw" }} />
                <span className="font-medium" style={ESCADA.texto.rotulo}>{label}</span>
              </button>
            ))}
          </div>
        </div>
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
