import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

interface TelaAutorizacaoProps {
  tipo: "video" | "foto";
  nome: string;
  autorizado: boolean;
  onAutorizadoChange: (v: boolean) => void;
  onAnterior: () => void;
  onProximo: () => void;
}

/**
 * Medidas das p.7 (vídeo) e p.8 (foto) do PDF, canvas 1920×1080.
 *
 * A tela é posicionada por coordenadas, e não por fluxo. Antes ela empilhava ícone,
 * título, chamada e caixa numa coluna flex e empurrava tudo com uma margem única
 * calibrada no olho — bastava o nome do visitante ser mais curto ou mais longo para
 * o conjunto inteiro escorregar. Como o protótipo divide a tela em duas metades bem
 * definidas, cada peça agora sai direto do número do arquivo.
 */
const XD = {
  /**
   * Metade de cima: ícone no topo, texto logo abaixo.
   *
   * Os dois ícones não começam na mesma altura no protótipo: o de vídeo mede 156×156
   * e o de foto 162×131. Como o desenho de foto é mais baixo, ele desce 20px para os
   * dois terminarem juntos, na mesma linha invisível acima do texto.
   *
   * Ícone e texto sobem juntos por `SUBIDA`, mantendo a distância entre eles.
   */
  icone: { topo: { video: 78, foto: 98 } },
  titulo: { topo: 362, texto: "2.06vw", altura: 1.32 },
  /** Metade de baixo: a chamada e a caixa de autorização. */
  chamada: { topo: "60.83vh", texto: "2.78vw", espacamento: "5px" },
  caixa: {
    esquerda: "18.54vw",
    topo: "74.91vh",
    largura: "62.97vw",
    altura: "9.17vh",
    /** Bolinha: 58×58, a 39px da borda esquerda da caixa. */
    marca: "3.02vw",
    recuoMarca: "2.03vw",
    /** O texto começa 46px depois da bolinha (499 − 453). */
    espacoTexto: "2.4vw",
  },
} as const;

/**
 * Quanto a metade de cima sobe em relação ao protótipo, em px do canvas 1080.
 *
 * Desvio pedido: no arquivo sobra muito ar entre o ícone e o texto, e o conjunto
 * fica baixo demais para a metade que ocupa. Ícone e texto sobem juntos, então a
 * distância entre eles não muda — é este o único número a mexer para calibrar.
 */
const SUBIDA = 40;

/** Converte uma altura do canvas 1080 em vh, já descontada a subida. */
const alturaSubida = (px: number) => `${(((px - SUBIDA) / 1080) * 100).toFixed(2)}vh`;

export function TelaAutorizacao({
  tipo,
  nome,
  autorizado,
  onAutorizadoChange,
  onAnterior,
  onProximo,
}: TelaAutorizacaoProps) {
  return (
    <div className="relative h-screen w-screen" style={ESCADA.tela}>
      <div style={ESCADA.logo.posicao}>
        <Logo variante="escura1-vertical" style={{ width: ESCADA.logo.largura }} />
      </div>

      <Image
        src={tipo === "video" ? "/icons/escada/video.png" : "/icons/escada/foto.png"}
        alt=""
        width={131}
        height={131}
        className="absolute -translate-x-1/2"
        style={{
          left: "50%",
          top: alturaSubida(XD.icone.topo[tipo]),
          width: ESCADA.icone,
          height: ESCADA.icone,
        }}
      />

      <h1
        className="absolute text-center"
        style={{
          ...ESCADA.texto.titulo,
          /**
           * Ancorado nas duas laterais, e não centralizado por `left: 50%`: com um
           * lado só, a largura disponível vira a metade da tela e a frase quebra
           * antes da hora. Assim ela ocupa a faixa inteira e só quebra se o nome do
           * visitante — que entra no meio dela e não tem limite — exigir.
           */
          left: "7vw",
          right: "7vw",
          top: alturaSubida(XD.titulo.topo),
          fontSize: XD.titulo.texto,
          lineHeight: XD.titulo.altura,
        }}
      >
        <span className="block">
          <span className="font-bold">{nome || "Visitante"}</span>
          <span className="font-medium">, falta pouco, precisamos da sua autorização</span>
        </span>
        <span className="block whitespace-nowrap font-medium">
          para que o museu utilize sua imagem.
        </span>
      </h1>

      <p
        className="pointer-events-none absolute w-full text-center font-medium"
        style={{
          top: XD.chamada.topo,
          color: cores.textoEscuro,
          fontSize: XD.chamada.texto,
          letterSpacing: XD.chamada.espacamento,
          lineHeight: 1.22,
        }}
      >
        Clique aqui para permitir o uso.
      </p>

      <button
        onClick={() => onAutorizadoChange(!autorizado)}
        className="absolute flex cursor-pointer items-center"
        style={{
          left: XD.caixa.esquerda,
          top: XD.caixa.topo,
          width: XD.caixa.largura,
          height: XD.caixa.altura,
          backgroundColor: "#E2B291",
          borderRadius: "0.21vw",
          paddingLeft: XD.caixa.recuoMarca,
          gap: XD.caixa.espacoTexto,
        }}
      >
        {/*
          Desmarcada, a bolinha ganha um anel escuro em vez de ser só um disco branco
          cheio. No protótipo ela é branca sólida, mas sobre o tom claro da caixa isso
          lê como já marcada — e num termo de uso de imagem não pode restar dúvida
          sobre o que o visitante consentiu. Com o anel, vazio parece vazio.
        */}
        <span
          className="flex-shrink-0 rounded-full"
          style={{
            width: XD.caixa.marca,
            height: XD.caixa.marca,
            backgroundColor: autorizado ? cores.textoEscuro : "#FFFFFF",
            border: `0.21vw solid ${cores.textoEscuro}`,
          }}
        />
        <span
          className="font-medium"
          style={{
            color: cores.textoEscuro,
            fontSize: XD.chamada.texto,
            letterSpacing: XD.chamada.espacamento,
          }}
        >
          Eu autorizo o uso da minha imagem
        </span>
      </button>

      <Navegacao
        onAnterior={onAnterior}
        onProximo={onProximo}
        proximoHabilitado={autorizado}
        centralizado
        {...ESCADA.navegacao}
      />
    </div>
  );
}
