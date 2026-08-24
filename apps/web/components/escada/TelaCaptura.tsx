import { useEffect } from "react";
import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";
import { useCamera } from "@/lib/escada/useCamera";

const DURACAO_MAXIMA_VIDEO_S = 60;

/**
 * Medidas das referências `design/escada/Telafoto.jpeg` e `Telavideo.jpeg`,
 * convertidas para o canvas 1920×1080.
 *
 * Esta tela não usa a moldura `ESCADA.tela` das demais: cada peça é posicionada por
 * coordenada. Antes ela era uma grade de duas colunas centralizada verticalmente, o
 * que deixava a prévia e o texto flutuando conforme o tamanho do parágrafo — e o
 * parágrafo muda entre foto e vídeo.
 */
const XD = {
  logo: { esquerda: "4.53vw", topo: "5.46vh", largura: "17.29vw" },
  /**
   * Prévia da câmera, à esquerda.
   *
   * A altura sai da proporção 16:9 sobre a largura, e não de um valor em `vh`. Com
   * largura em `vw` e altura em `vh` os dois eixos escalam independentes, e a caixa
   * esticava conforme o formato do monitor — só ficava certa num 16:9 exato. Aqui a
   * proporção é a mesma em qualquer tela.
   */
  previa: { esquerda: "3.9vw", topo: "24.63vh", largura: "51.04vw", proporcao: "16 / 9" },
  /** Contador regressivo, dentro da prévia, no canto superior direito. */
  contador: { recuo: "1.4vw", tamanho: "5.94vw", texto: "3.2vw" },
  /**
   * Coluna da direita. Tudo nela é centralizado em x=1468 — título, parágrafo,
   * botões, cronômetro e barra compartilham esse eixo.
   */
  /**
   * 637px de largura, centrados em x=1468.
   *
   * A largura é o que decide onde o parágrafo quebra, e nas referências ele tem
   * quatro linhas nas duas telas. A coluna acompanhou a redução do corpo do texto na
   * mesma proporção (de 690 para 637, como o texto de 45,5 para 42): sem isso a tela
   * de foto caía para três linhas e o bloco ficava largo e achatado.
   */
  coluna: { esquerda: "59.87vw", largura: "33.18vw", texto: "2.19vw", altura: 1.15 },
  /** O bloco de texto começa mais alto no vídeo, que tem uma linha a mais. */
  textoTopo: { video: "14.44vh", foto: "23.43vh" },
  botao: {
    /** Círculo de GRAVAR. */
    circulo: "10.16vw",
    /** O de FOTO é 10% menor que o de GRAVAR — pedido, não medido da referência. */
    circuloFoto: "9.14vw",
    /** PARAR é um quadrado arredondado, não um círculo — o desenho já vem no PNG. */
    parar: { largura: "9.53vw", altura: "9.53vw" },
    espaco: "3.54vw",
    rotulo: "1.96vw",
  },
  foto: { botaoTopo: "55.19vh", rotuloTopo: "76.2vh" },
  video: {
    botoesTopo: "41.76vh",
    rotulosTopo: "62.22vh",
    cronometroTopo: "73.98vh",
    barra: { topo: "80.56vh", largura: "24.9vw", altura: "1.85vh" },
    legendaTopo: "85.65vh",
  },
  navegacao: { topo: "86.11vh" },
} as const;

interface TelaCapturaProps {
  tipo: "video" | "foto";
  onCapturado: (blob: Blob, url: string) => void;
  onAnterior: () => void;
}

/**
 * Botão de captura.
 *
 * O PNG já é o botão inteiro — `fotografar.png` é o círculo bege com a câmera dentro,
 * `pause.png` é o quadrado arredondado com o quadrado escuro. Por isso a imagem ocupa
 * o botão todo e não há fundo desenhado por baixo: antes o ícone era posto pequeno
 * dentro de um círculo bege feito em CSS, e o resultado era um botão dentro do outro.
 */
function BotaoCaptura({
  icone,
  onClick,
  desabilitado = false,
  tamanho,
}: {
  icone: string;
  onClick: () => void;
  desabilitado?: boolean;
  tamanho: { width: string; height: string };
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className="cursor-pointer disabled:opacity-40"
      style={tamanho}
    >
      <Image src={icone} alt="" width={401} height={401} style={{ ...tamanho }} />
    </button>
  );
}

export function TelaCaptura({ tipo, onCapturado, onAnterior }: TelaCapturaProps) {
  // Desestruturado, e não usado como `camera.x`: o objeto do hook carrega um ref
  // (`videoRef`), e ler qualquer campo dele no corpo do componente faz a regra
  // `react-hooks/refs` acusar acesso a ref durante o render — mesmo em campos que
  // são estado comum, como `contagemRegressiva`.
  const {
    videoRef,
    streamPronto,
    erro,
    contagemRegressiva,
    gravando,
    segundos,
    midiaBlob,
    midiaUrl,
    iniciarGravacao,
    pararGravacao,
    tirarFoto,
  } = useCamera(tipo === "video" ? "video" : "foto");

  useEffect(() => {
    if (midiaBlob && midiaUrl) onCapturado(midiaBlob, midiaUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midiaBlob, midiaUrl]);

  const segundosFormatado = String(segundos).padStart(2, "0");

  const colunaDireita: React.CSSProperties = {
    position: "absolute",
    left: XD.coluna.esquerda,
    width: XD.coluna.largura,
    textAlign: "center",
  };

  const rotulo: React.CSSProperties = {
    ...colunaDireita,
    color: cores.textoEscuro,
    fontSize: XD.botao.rotulo,
    fontWeight: 500,
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: cores.fundoClaro }}
    >
      {/* Nesta tela a logo é a horizontal, não a vertical das telas de formulário. */}
      <Logo
        variante="escura"
        style={{
          position: "absolute",
          left: XD.logo.esquerda,
          top: XD.logo.topo,
          width: XD.logo.largura,
        }}
      />

      <div
        className="absolute overflow-hidden bg-black"
        style={{
          left: XD.previa.esquerda,
          top: XD.previa.topo,
          width: XD.previa.largura,
          aspectRatio: XD.previa.proporcao,
          borderRadius: "0.3vw",
        }}
      >
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        {contagemRegressiva !== null && (
          <div
            className="absolute flex items-center justify-center rounded-full font-medium text-white"
            style={{
              right: XD.contador.recuo,
              top: XD.contador.recuo,
              width: XD.contador.tamanho,
              height: XD.contador.tamanho,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              fontSize: XD.contador.texto,
            }}
          >
            {contagemRegressiva}
          </div>
        )}
      </div>

      {/*
        Título e parágrafo formam um bloco de texto só. Nas referências a primeira
        linha é apenas a mesma linha em negrito, com o mesmo corpo e a mesma
        entrelinha do restante — não um título separado com respiro próprio.
      */}
      <div
        style={{
          ...colunaDireita,
          top: XD.textoTopo[tipo],
          color: cores.textoEscuro,
          fontSize: XD.coluna.texto,
          lineHeight: XD.coluna.altura,
        }}
      >
        {tipo === "video" ? (
          <>
            <p className="font-bold">Posicione-se diante da câmera.</p>
            <p className="font-medium">
              A câmera começará a gravar 5 segundos após você apertar no botão GRAVAR.
              Quando terminar, aperte no botão PARAR.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold">Hora da foto!</p>
            <p className="font-medium">
              Posicione-se diante da câmera e clique em FOTO. Após pressionar o botão, você
              terá 5 segundos para se preparar.
            </p>
          </>
        )}
      </div>

      {tipo === "foto" ? (
        <>
          <div style={{ ...colunaDireita, top: XD.foto.botaoTopo }} className="flex justify-center">
            <BotaoCaptura
              icone="/icons/escada/fotografar.png"
              onClick={tirarFoto}
              desabilitado={!streamPronto || contagemRegressiva !== null}
              tamanho={{ width: XD.botao.circuloFoto, height: XD.botao.circuloFoto }}
            />
          </div>
          <span style={{ ...rotulo, top: XD.foto.rotuloTopo }}>FOTO</span>
        </>
      ) : (
        <>
          <div
            style={{ ...colunaDireita, top: XD.video.botoesTopo }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center" style={{ gap: XD.botao.espaco }}>
              <BotaoCaptura
                icone={gravando ? "/icons/escada/gravando.png" : "/icons/escada/play.png"}
                onClick={iniciarGravacao}
                desabilitado={
                  gravando || !streamPronto || contagemRegressiva !== null
                }
                tamanho={{ width: XD.botao.circulo, height: XD.botao.circulo }}
              />
              <BotaoCaptura
                icone="/icons/escada/pause.png"
                onClick={pararGravacao}
                desabilitado={!gravando}
                tamanho={{ width: XD.botao.parar.largura, height: XD.botao.parar.altura }}
              />
            </div>
          </div>

          <div
            style={{ ...rotulo, top: XD.video.rotulosTopo }}
            className="flex items-center justify-center"
          >
            {/* Os rótulos acompanham os botões: mesma largura, mesmo espaço entre eles. */}
            <div className="flex items-center" style={{ gap: XD.botao.espaco }}>
              <span style={{ width: XD.botao.circulo }}>GRAVAR</span>
              <span style={{ width: XD.botao.parar.largura }}>PARAR</span>
            </div>
          </div>

          <div
            style={{ ...colunaDireita, top: XD.video.cronometroTopo }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center" style={{ gap: "0.8vw" }}>
              <Image
                src="/icons/escada/reloginho.png"
                alt=""
                width={20}
                height={20}
                style={{ width: "1.8vw", height: "1.8vw" }}
              />
              <span
                className="font-bold"
                style={{ color: cores.textoEscuro, fontSize: XD.botao.rotulo }}
              >
                {segundosFormatado}
              </span>
              <span
                className="font-medium"
                style={{ color: cores.textoEscuro, fontSize: XD.botao.rotulo }}
              >
                segundos
              </span>
            </div>
          </div>

          <div
            style={{ ...colunaDireita, top: XD.video.barra.topo }}
            className="flex justify-center"
          >
            <div
              className="overflow-hidden"
              style={{
                width: XD.video.barra.largura,
                height: XD.video.barra.altura,
                borderRadius: "999px",
                backgroundColor: cores.botaoTan,
              }}
            >
              <div
                className="h-full"
                style={{
                  backgroundColor: cores.textoEscuro,
                  width: `${Math.min(100, (segundos / DURACAO_MAXIMA_VIDEO_S) * 100)}%`,
                }}
              />
            </div>
          </div>

          <span style={{ ...rotulo, top: XD.video.legendaTopo, fontSize: "1.25vw" }}>
            Até 1 minuto de duração.
          </span>
        </>
      )}

      {erro && (
        <p
          className="absolute w-full text-center font-bold"
          style={{ top: "92vh", color: "#B3261E", fontSize: ESCADA.texto.rotulo.fontSize }}
          role="alert"
        >
          {erro}
        </p>
      )}

      {/* Só ANTERIOR: a tela avança sozinha quando a captura termina. */}
      <div className="absolute inset-x-0" style={{ top: XD.navegacao.topo }}>
        <Navegacao onAnterior={onAnterior} />
      </div>
    </div>
  );
}
