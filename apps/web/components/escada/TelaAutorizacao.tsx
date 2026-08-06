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

        <h1 style={ESCADA.texto.titulo}>
          <span className="block whitespace-nowrap">
            <span className="font-bold">{nome || "Visitante"}</span>
            <span className="font-medium">, falta pouco, precisamos da sua autorização</span>
          </span>
          <span className="block whitespace-nowrap font-medium">para que o museu utilize sua imagem.</span>
        </h1>

        <p className="font-medium" style={ESCADA.texto.secundario}>
          Clique aqui para permitir o uso.
        </p>

        <button
          onClick={() => onAutorizadoChange(!autorizado)}
          className="flex cursor-pointer items-center"
          style={{ ...ESCADA.campo, gap: "1.2vw", justifyContent: "flex-start" }}
        >
          <span
            className="flex-shrink-0 rounded-full"
            style={{
              width: "1.9vw",
              height: "1.9vw",
              backgroundColor: autorizado ? cores.textoEscuro : "#FFFFFF",
            }}
          />
          <span style={ESCADA.texto.corpo}>Eu autorizo o uso da minha imagem</span>
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
