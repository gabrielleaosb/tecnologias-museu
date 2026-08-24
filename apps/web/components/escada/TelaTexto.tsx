import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";

const LIMITE_CARACTERES = 150;

// Medidas da p.18/19 do PDF "Depoimentos (Tablet).pdf", canvas 1920×1080.
// Esta tela não segue a moldura das telas de formulário: o título é centralizado em
// três linhas, a caixa de texto é uma peça larga e baixa, e o contador fica à direita
// dela em duas linhas — não embaixo, como estava.
const XD = {
  titulo: { topo: "15vh", texto: "2.26vw", altura: 1.28 },
  caixa: {
    esquerda: "19.74vw",
    topo: "34.44vh",
    largura: "60.47vw",
    altura: "28.24vh",
    raio: "0.68vw",
    // O texto começa em x=467 e y=411, contra a caixa em x=379 e y=372: 88px de
    // recuo lateral, mas só 39 no topo. Aplicar os 88 nos quatro lados sobrava
    // pouca altura para as linhas e a caixa passava a rolar com o texto ainda curto.
    recuo: "3.6vh 4.58vw",
    texto: "2.26vw",
  },
  contador: { esquerda: "82vw", topo: "46.4vh", texto: "1.96vw", cor: "#996742" },
  /**
   * O PRÓXIMO desta tela é menor que o das telas de formulário, e a seta acompanha:
   * 28×43 contra 31×49. Numa caixa de 54 o PNG rende esse tamanho. O recuo da borda
   * vem do token compartilhado, para não descolar do par ANTERIOR/PRÓXIMO das outras
   * telas quando alguém calibrar aquele valor.
   */
  proximo: { topo: "19.7vh", texto: "1.68vw", icone: "2.81vw" },
} as const;

interface TelaTextoProps {
  tipo: "video" | "foto";
  texto: string;
  onTextoChange: (v: string) => void;
  onAnterior: () => void;
  onProximo: () => void;
  enviando: boolean;
  /** Mensagem de falha no envio; mantém o visitante na tela para tentar de novo. */
  erro?: string | null;
}

export function TelaTexto({
  tipo,
  texto,
  onTextoChange,
  onAnterior,
  onProximo,
  enviando,
  erro,
}: TelaTextoProps) {
  return (
    <div className="relative h-screen w-screen" style={ESCADA.tela}>
      {/*
        Logo horizontal, no mesmo lugar e tamanho da captura e da preview. Esta tela
        vem logo depois delas, e a vertical fazia a marca saltar de posição e de
        formato bem no meio da sequência.
      */}
      <Logo
        variante="escura"
        style={{ position: "absolute", left: "4.53vw", top: "5.46vh", width: "17.29vw" }}
      />

      <h1
        // `inset-x-0`, e não `w-full`: sem `left` definido, um elemento absoluto
        // fica na posição estática — deslocada pelo padding de 2,5vw da moldura —
        // enquanto a largura cobre a caixa toda, o que jogava o centro 48px à direita.
        className="pointer-events-none absolute inset-x-0 text-center"
        style={{ ...ESCADA.texto.titulo, top: XD.titulo.topo, fontSize: XD.titulo.texto, lineHeight: XD.titulo.altura }}
      >
        <span className="block font-bold">Para complementar {tipo === "video" ? "o vídeo" : "a foto"},</span>
        <span className="block font-medium">você pode acrescentar um texto.</span>
        {/* "(Opcional)" vem em Book no PDF, em linha própria — mais leve que o resto. */}
        <span className="block" style={{ fontWeight: 400 }}>
          (Opcional)
        </span>
      </h1>

      <textarea
        value={texto}
        maxLength={LIMITE_CARACTERES}
        onChange={(e) => onTextoChange(e.target.value)}
        placeholder="Escreva aqui, se quiser."
        // Quem digita é o teclado do app; sem isto o do sistema abriria por cima.
        inputMode="none"
        className="absolute resize-none outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
        style={{
          left: XD.caixa.esquerda,
          top: XD.caixa.topo,
          width: XD.caixa.largura,
          height: XD.caixa.altura,
          backgroundColor: cores.botaoTan,
          borderRadius: XD.caixa.raio,
          color: cores.textoEscuro,
          fontSize: XD.caixa.texto,
          fontWeight: 500,
          lineHeight: 1.25,
          padding: XD.caixa.recuo,
        }}
      />

      {/* Contador à direita da caixa, em duas linhas: o número em bold, a palavra em medium. */}
      <div
        className="absolute text-center"
        style={{ left: XD.contador.esquerda, top: XD.contador.topo, color: XD.contador.cor }}
      >
        <span className="block font-bold" style={{ fontSize: XD.contador.texto }}>
          {texto.length}/{LIMITE_CARACTERES}
        </span>
        <span className="block font-medium" style={{ fontSize: XD.contador.texto }}>
          caracteres
        </span>
      </div>

      {erro && (
        <p
          className="pointer-events-none absolute inset-x-0 text-center font-bold"
          style={{ top: "66vh", color: "#B3261E", fontSize: ESCADA.texto.rotulo.fontSize }}
          role="alert"
        >
          {erro}
        </p>
      )}

      {/*
        ANTERIOR volta para a revisão da mídia. Não está no PDF, mas sem ele quem se
        arrepende da foto ou do vídeo depois de confirmar não tem como refazer: o
        único caminho seria abandonar o depoimento e recomeçar do zero.

        Fica espelhando o PRÓXIMO, na mesma altura, e não no meio da lateral como nas
        telas de formulário — ali ele passaria por cima da caixa de texto, que é larga.
      */}
      <button
        onClick={onAnterior}
        disabled={enviando}
        className="absolute flex cursor-pointer items-center disabled:opacity-40"
        style={{
          left: ESCADA.navegacao.recuo,
          top: XD.proximo.topo,
          gap: ESCADA.navegacao.espaco,
        }}
      >
        <Image
          src="/icons/escada/seta2.png"
          alt=""
          width={401}
          height={401}
          style={{
            width: XD.proximo.icone,
            height: XD.proximo.icone,
            transform: "scaleX(-1)",
          }}
        />
        <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: XD.proximo.texto }}>
          ANTERIOR
        </span>
      </button>

      {/* No PDF o PRÓXIMO desta tela fica no alto à direita, e não no meio da lateral. */}
      <button
        onClick={onProximo}
        disabled={enviando}
        className="absolute flex cursor-pointer items-center disabled:opacity-40"
        style={{
          right: ESCADA.navegacao.recuo,
          top: XD.proximo.topo,
          gap: ESCADA.navegacao.espaco,
        }}
      >
        <span className="font-bold" style={{ color: cores.textoEscuro, fontSize: XD.proximo.texto }}>
          {enviando ? "ENVIANDO..." : "PRÓXIMO"}
        </span>
        {!enviando && (
          <Image
            src="/icons/escada/seta2.png"
            alt=""
            width={401}
            height={401}
            style={{ width: XD.proximo.icone, height: XD.proximo.icone }}
          />
        )}
      </button>
    </div>
  );
}
