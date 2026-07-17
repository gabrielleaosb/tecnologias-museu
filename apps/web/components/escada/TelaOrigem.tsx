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
      <div className="absolute left-[47px] top-[52px] sm:left-[63px] sm:top-[68px]">
        <Logo variante="escura1-vertical" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-start gap-8 pt-16 text-center sm:pt-20">
        <h1 className="text-[28.8px] font-extrabold sm:text-[34.56px]" style={{ color: cores.textoEscuro }}>
          <span className="whitespace-nowrap">Olá {nome || "visitante"}, estamos prestes a começar.</span>
          <br />
          <span className="whitespace-nowrap font-normal">Antes disso, conte pra nós:</span>
        </h1>

        <p className="text-[25.92px]" style={{ color: cores.textoEscuro }}>
          De onde você veio?
        </p>

        <div className="flex w-full max-w-[900px] flex-col gap-3">
          <label className="flex items-center gap-4">
            <span className="w-24 text-left text-[19.2px] font-bold" style={{ color: cores.textoEscuro }}>
              PAÍS
            </span>
            <input
              type="text"
              inputMode="none"
              value={pais}
              onChange={(e) => onPaisChange(e.target.value)}
              placeholder="Brasil"
              className="flex-1 px-[28.8px] text-center text-[25.92px] outline-none placeholder:font-medium placeholder:text-[37px] placeholder:tracking-[3.7px] placeholder:text-[#3D2A1A]"
              style={{
                height: 58,
                maxWidth: 827,
                backgroundColor: "#E2B291",
                borderRadius: 4,
                opacity: 1,
                color: cores.textoEscuro,
              }}
            />
          </label>
          <label className="flex items-center gap-4">
            <span className="w-24 text-left text-[19.2px] font-bold" style={{ color: cores.textoEscuro }}>
              ESTADO
            </span>
            <input
              type="text"
              inputMode="none"
              value={estado}
              onChange={(e) => onEstadoChange(e.target.value)}
              placeholder="Alagoas"
              className="flex-1 px-[28.8px] text-center text-[25.92px] outline-none placeholder:font-medium placeholder:text-[37px] placeholder:tracking-[3.7px] placeholder:text-[#3D2A1A]"
              style={{
                height: 58,
                maxWidth: 827,
                backgroundColor: "#E2B291",
                borderRadius: 4,
                opacity: 1,
                color: cores.textoEscuro,
              }}
            />
          </label>
        </div>
      </div>

      <Navegacao
        onAnterior={onAnterior}
        onProximo={onProximo}
        proximoHabilitado={habilitado}
        centralizado
        tamanhoTexto={25.92}
        tamanhoIcone={24}
      />
    </div>
  );
}
