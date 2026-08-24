import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";

/**
 * As duas setas são o mesmo arquivo.
 *
 * O ANTERIOR usava `voltar1.png`, um desenho diferente do `seta2.png` do PRÓXIMO —
 * lado a lado numa mesma tela os dois não combinavam. Agora a da esquerda é a mesma
 * seta espelhada, o que garante peso, espessura e proporção idênticos aos da direita
 * sem depender de dois arquivos continuarem parecidos.
 */
const SETA = "/icons/escada/seta2.png";

interface NavegacaoProps {
  onAnterior?: () => void;
  onProximo?: () => void;
  proximoHabilitado?: boolean;
  centralizado?: boolean;
  tamanhoTexto?: string;
  tamanhoIcone?: string;
  recuo?: string;
  espaco?: string;
}

export function Navegacao({
  onAnterior,
  onProximo,
  proximoHabilitado = true,
  centralizado = false,
  tamanhoTexto = ESCADA.navegacao.tamanhoTexto,
  tamanhoIcone = ESCADA.navegacao.tamanhoIcone,
  recuo = ESCADA.navegacao.recuo,
  espaco = ESCADA.navegacao.espaco,
}: NavegacaoProps) {
  const estiloIcone = { width: tamanhoIcone, height: tamanhoIcone };
  const estiloTexto = { color: cores.textoEscuro, fontSize: tamanhoTexto };

  return (
    <div
      className={
        centralizado
          ? "pointer-events-none absolute inset-y-0 flex items-center justify-between"
          : "flex w-full items-center justify-between"
      }
      style={
        centralizado
          ? { left: recuo, right: recuo }
          : // Em fluxo o container já herda o respiro de 2,5vw da moldura da tela,
            // então aqui entra só a diferença até o recuo do protótipo.
            { paddingInline: `calc(${recuo} - 2.5vw)` }
      }
    >
      {onAnterior ? (
        <button
          onClick={onAnterior}
          className="pointer-events-auto flex cursor-pointer items-center"
          style={{ gap: espaco }}
        >
          <Image
            src={SETA}
            alt=""
            width={401}
            height={401}
            // Espelhada na horizontal: é a seta do PRÓXIMO apontando para o outro lado.
            style={{ ...estiloIcone, transform: "scaleX(-1)" }}
          />
          <span className="font-bold tracking-wide" style={estiloTexto}>
            ANTERIOR
          </span>
        </button>
      ) : (
        <span />
      )}

      {onProximo && (
        <button
          onClick={onProximo}
          disabled={!proximoHabilitado}
          className="pointer-events-auto flex cursor-pointer items-center disabled:cursor-not-allowed disabled:opacity-40"
          style={{ gap: espaco }}
        >
          <span className="font-bold tracking-wide" style={estiloTexto}>
            PRÓXIMO
          </span>
          <Image src={SETA} alt="" width={401} height={401} style={estiloIcone} />
        </button>
      )}
    </div>
  );
}
