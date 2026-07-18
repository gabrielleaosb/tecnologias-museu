import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

// Canvas 1920×1080. Inputs: w=827px→43.07vw, h=58px→5.37vh
// Logo: left=47px→2.45vw, top=52px→4.81vh
// Ícone vídeo/foto: 130.5px→6.79vw

interface TelaInformacoesProps {
  tipo: "video" | "foto";
  nome: string;
  email: string;
  onNomeChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onAnterior: () => void;
  onProximo: () => void;
}

export function TelaInformacoes({ tipo, nome, email, onNomeChange, onEmailChange, onAnterior, onProximo }: TelaInformacoesProps) {
  const habilitado = nome.trim().length > 0 && email.trim().length > 0;

  const estiloInput: React.CSSProperties = {
    width: "43.07vw",
    maxWidth: "100%",
    height: "5.37vh",
    backgroundColor: "#E2B291",
    borderRadius: "0.21vw",
    color: cores.textoEscuro,
    fontSize: "1.35vw",
    padding: "0 1.5vw",
    outline: "none",
  };

  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-between"
      style={{ backgroundColor: cores.fundoClaro, padding: "2.5vw" }}
    >
      <div style={{ position: "absolute", left: "5.5vw", top: "calc(2.5vw + 2vh)" }}>
        <Logo variante="escura1-vertical" style={{ width: "11.53vw" }} />
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-start text-center"
        style={{ gap: "1.25vw", paddingTop: "8.33vh" }}
      >
        <Image
          src={tipo === "video" ? "/icons/escada/video.png" : "/icons/escada/foto.png"}
          alt=""
          width={131}
          height={131}
          style={{ width: "6.79vw", height: "6.79vw" }}
        />

        <h1 style={{ color: cores.textoEscuro, fontSize: "2.08vw", letterSpacing: "4px" }}>
          <span className="block whitespace-nowrap font-bold">
            Você optou por {tipo === "video" ? "gravar um vídeo" : "tirar uma foto"},
          </span>
          <span className="block whitespace-nowrap font-medium">siga as instruções, são apenas algumas etapas.</span>
        </h1>

        <p className="font-medium" style={{ color: "#895C3B", fontSize: "2.08vw", letterSpacing: "4px" }}>
          Informações básicas (obrigatório)
        </p>

        <div className="flex flex-col items-center" style={{ gap: "0.63vw" }}>
          <input
            type="text"
            inputMode="none"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome"
            className="text-center outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
            style={{
              ...estiloInput,
              // @ts-ignore
              "--placeholder-font-size": "1.93vw",
              "--placeholder-tracking": "3.7px",
            }}
          />
          <input
            type="email"
            inputMode="none"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="E-mail"
            className="text-center outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
            style={estiloInput}
          />
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
