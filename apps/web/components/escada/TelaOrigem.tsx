import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

// Canvas 1920×1080. Inputs: max-w=827px→43.07vw, h=58px→5.37vh
// Logo: left=47px→2.45vw, top=52px→4.81vh

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

  const estiloInput: React.CSSProperties = {
    flex: 1,
    maxWidth: "43.07vw",
    height: "5.37vh",
    backgroundColor: "#E2B291",
    borderRadius: "0.21vw",
    color: cores.textoEscuro,
    fontSize: "1.35vw",
    padding: "0 1.5vw",
    textAlign: "center",
    outline: "none",
  };

  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-between"
      style={{ backgroundColor: cores.fundoClaro, padding: "2.5vw" }}
    >
      <div style={{ position: "absolute", left: "2.45vw", top: "4.81vh" }}>
        <Logo variante="escura1-vertical" />
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-start text-center"
        style={{ gap: "1.67vw", paddingTop: "8.33vh" }}
      >
        <h1 className="font-extrabold" style={{ color: cores.textoEscuro, fontSize: "1.8vw" }}>
          <span className="block whitespace-nowrap">Olá {nome || "visitante"}, estamos prestes a começar.</span>
          <span className="block whitespace-nowrap font-normal">Antes disso, conte pra nós:</span>
        </h1>

        <p style={{ color: cores.textoEscuro, fontSize: "1.35vw" }}>
          De onde você veio?
        </p>

        <div className="flex flex-col" style={{ width: "46.88vw", gap: "0.63vw" }}>
          <label className="flex items-center" style={{ gap: "0.83vw" }}>
            <span className="font-bold text-left" style={{ color: cores.textoEscuro, fontSize: "1vw", width: "5vw" }}>
              PAÍS
            </span>
            <input
              type="text"
              inputMode="none"
              value={pais}
              onChange={(e) => onPaisChange(e.target.value)}
              placeholder="Brasil"
              className="outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
              style={estiloInput}
            />
          </label>
          <label className="flex items-center" style={{ gap: "0.83vw" }}>
            <span className="font-bold text-left" style={{ color: cores.textoEscuro, fontSize: "1vw", width: "5vw" }}>
              ESTADO
            </span>
            <input
              type="text"
              inputMode="none"
              value={estado}
              onChange={(e) => onEstadoChange(e.target.value)}
              placeholder="Alagoas"
              className="outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
              style={estiloInput}
            />
          </label>
        </div>
      </div>

      <Navegacao
        onAnterior={onAnterior}
        onProximo={onProximo}
        proximoHabilitado={habilitado}
        centralizado
        tamanhoTexto="1.35vw"
        tamanhoIcone="1.25vw"
      />
    </div>
  );
}
