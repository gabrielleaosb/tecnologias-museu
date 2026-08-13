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

// Medidas específicas desta tela, tiradas do XD (canvas 1920×1080) — não entram no
// token compartilhado ESCADA porque valem só aqui: o campo das outras telas é bem
// menor (827×58) que esta caixa de autorização (1209×99).
const XD = {
  /**
   * Respiro entre o ícone de vídeo/foto e o título. É este valor que empurra o resto
   * da coluna para baixo até a caixa de autorização cair no `top: 809px` do XD —
   * mexer aqui reposiciona título, chamada e caixa juntos.
   */
  espacoAbaixoDoIcone: "29.57vh",
  /** "Clique aqui para permitir o uso." e o texto da caixa: 54px. */
  texto54: { fontSize: "2.81vw", letterSpacing: "5.4px" },
  /** Caixa "Eu autorizo": 1209×99, raio 4px, #E2B291. */
  caixa: {
    width: "62.97vw",
    height: "9.17vh",
    // Sem isto o flex da coluna encolhe a caixa e ela não fecha os 99px do XD.
    flexShrink: 0,
    backgroundColor: "#E2B291",
    borderRadius: "0.21vw",
    padding: "0 1.5vw",
  },
} as const;

export function TelaAutorizacao({
  tipo,
  nome,
  autorizado,
  onAutorizadoChange,
  onAnterior,
  onProximo,
}: TelaAutorizacaoProps) {
  return (
    <div className="relative flex h-screen w-screen flex-col justify-between" style={ESCADA.tela}>
      <div style={ESCADA.logo.posicao}>
        <Logo variante="escura1-vertical" style={{ width: ESCADA.logo.largura }} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-start text-center" style={ESCADA.conteudo}>
        <Image
          src={tipo === "video" ? "/icons/escada/video.png" : "/icons/escada/foto.png"}
          alt=""
          width={131}
          height={131}
          style={{ width: ESCADA.icone, height: ESCADA.icone }}
        />

        <h1 style={{ ...ESCADA.texto.titulo, marginTop: XD.espacoAbaixoDoIcone }}>
          <span className="block whitespace-nowrap">
            <span className="font-bold">{nome || "Visitante"}</span>
            <span className="font-medium">, falta pouco, precisamos da sua autorização</span>
          </span>
          <span className="block whitespace-nowrap font-medium">para que o museu utilize sua imagem.</span>
        </h1>

        <p className="font-medium" style={{ ...ESCADA.texto.secundario, ...XD.texto54 }}>
          Clique aqui para permitir o uso.
        </p>

        <button
          onClick={() => onAutorizadoChange(!autorizado)}
          className="flex cursor-pointer items-center"
          style={{
            ...ESCADA.campo,
            ...XD.caixa,
            gap: "1.2vw",
            justifyContent: "flex-start",
          }}
        >
          <span
            className="flex-shrink-0 rounded-full"
            style={{
              width: "1.9vw",
              height: "1.9vw",
              backgroundColor: autorizado ? cores.textoEscuro : "#FFFFFF",
            }}
          />
          <span style={{ ...ESCADA.texto.corpo, ...XD.texto54 }}>
            Eu autorizo o uso da minha imagem
          </span>
        </button>
      </div>

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
