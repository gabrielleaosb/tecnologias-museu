import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

interface TelaOrigemProps {
  nome: string;
  pais: string;
  estado: string;
  onPaisChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onAnterior: () => void;
  onProximo: () => void;
}

export function TelaOrigem({ nome, pais, estado, onPaisChange, onEstadoChange, onAnterior, onProximo }: TelaOrigemProps) {
  const habilitado = pais.trim().length > 0 && estado.trim().length > 0;

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="absolute left-8 top-8 sm:left-12 sm:top-12">
        <Logo variante="escura" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <h1 className="max-w-lg text-xl font-extrabold sm:text-2xl" style={{ color: cores.textoEscuro }}>
          Olá {nome || "visitante"}, estamos prestes a começar.
          <br />
          <span className="font-normal">Antes disso, conte pra nós:</span>
        </h1>

        <p className="text-lg" style={{ color: cores.textoEscuro }}>
          De onde você veio?
        </p>

        <div className="flex w-full max-w-md flex-col gap-3">
          <label className="flex items-center gap-4">
            <span className="w-20 text-left font-bold" style={{ color: cores.textoEscuro }}>
              PAÍS
            </span>
            <input
              type="text"
              value={pais}
              onChange={(e) => onPaisChange(e.target.value)}
              placeholder="Brasil"
              className="flex-1 rounded-md px-5 py-3 text-center text-lg outline-none"
              style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
            />
          </label>
          <label className="flex items-center gap-4">
            <span className="w-20 text-left font-bold" style={{ color: cores.textoEscuro }}>
              ESTADO
            </span>
            <input
              type="text"
              value={estado}
              onChange={(e) => onEstadoChange(e.target.value)}
              placeholder="Alagoas"
              className="flex-1 rounded-md px-5 py-3 text-center text-lg outline-none"
              style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
            />
          </label>
        </div>
      </div>

      <Navegacao onAnterior={onAnterior} onProximo={onProximo} proximoHabilitado={habilitado} />
    </div>
  );
}
