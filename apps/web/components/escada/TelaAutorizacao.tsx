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
    <div className="relative flex h-screen w-screen flex-col justify-between p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="absolute left-8 top-8 sm:left-12 sm:top-12">
        <Logo variante="escura" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h1 className="max-w-lg text-xl font-extrabold sm:text-2xl" style={{ color: cores.textoEscuro }}>
          {nome || "Visitante"}, falta pouco, precisamos da sua autorização para que o museu utilize sua imagem.
        </h1>

        <p className="text-lg" style={{ color: cores.textoEscuro }}>
          Clique aqui para permitir o uso.
        </p>

        <button
          onClick={() => onAutorizadoChange(!autorizado)}
          className="flex w-full max-w-md items-center gap-4 rounded-md px-5 py-4 cursor-pointer"
          style={{ backgroundColor: cores.botaoTan }}
        >
          <span
            className="h-6 w-6 flex-shrink-0 rounded-full border-2"
            style={{
              borderColor: cores.textoEscuro,
              backgroundColor: autorizado ? cores.textoEscuro : "transparent",
            }}
          />
          <span className="text-lg" style={{ color: cores.textoEscuro }}>
            Eu autorizo o uso da minha imagem
          </span>
        </button>
      </div>

      <Navegacao onAnterior={onAnterior} onProximo={onProximo} proximoHabilitado={autorizado} />
    </div>
  );
}
