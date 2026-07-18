import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

interface TelaAutorizacaoProps {
  nome: string;
  autorizado: boolean;
  onAutorizadoChange: (v: boolean) => void;
  onAnterior: () => void;
  onProximo: () => void;
}

export function TelaAutorizacao({ nome, autorizado, onAutorizadoChange, onAnterior, onProximo }: TelaAutorizacaoProps) {
  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-between"
      style={{ backgroundColor: cores.fundoClaro, padding: "2.5vw" }}
    >
      <div style={{ position: "absolute", left: "2.5vw", top: "2.5vw" }}>
        <Logo variante="escura" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ gap: "1.67vw" }}>
        <h1
          className="font-extrabold"
          style={{ color: cores.textoEscuro, fontSize: "1.5vw", maxWidth: "26.67vw" }}
        >
          {nome || "Visitante"}, falta pouco, precisamos da sua autorização para que o museu utilize sua imagem.
        </h1>

        <p style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
          Clique aqui para permitir o uso.
        </p>

        <button
          onClick={() => onAutorizadoChange(!autorizado)}
          className="flex items-center cursor-pointer"
          style={{
            width: "23.33vw",
            gap: "0.83vw",
            borderRadius: "0.42vw",
            padding: "0.83vw 1.04vw",
            backgroundColor: cores.botaoTan,
          }}
        >
          <span
            className="flex-shrink-0 rounded-full"
            style={{
              width: "1.25vw",
              height: "1.25vw",
              border: `0.1vw solid ${cores.textoEscuro}`,
              backgroundColor: autorizado ? cores.textoEscuro : "transparent",
            }}
          />
          <span style={{ color: cores.textoEscuro, fontSize: "1.125vw" }}>
            Eu autorizo o uso da minha imagem
          </span>
        </button>
      </div>

      <Navegacao onAnterior={onAnterior} onProximo={onProximo} proximoHabilitado={autorizado} />
    </div>
  );
}
