import Image from "next/image";
import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

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

  return (
    <div className="relative flex h-screen w-screen flex-col justify-between p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="absolute left-[47px] top-[52px] sm:left-[63px] sm:top-[68px]">
        <Logo variante="escura1-vertical" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-start gap-6 pt-16 text-center sm:pt-20">
        <Image
          src={tipo === "video" ? "/icons/escada/video.png" : "/icons/escada/foto.png"}
          alt=""
          width={131}
          height={131}
          className="h-[130.5px] w-[130.5px]"
        />

        <h1 style={{ color: cores.textoEscuro, fontSize: 40, letterSpacing: 4 }}>
          <span className="whitespace-nowrap font-bold">
            Você optou por {tipo === "video" ? "gravar um vídeo" : "tirar uma foto"},
          </span>
          <br />
          <span className="whitespace-nowrap font-medium">siga as instruções, são apenas algumas etapas.</span>
        </h1>

        <p className="font-medium" style={{ color: "#895C3B", fontSize: 40, letterSpacing: 4 }}>
          Informações básicas (obrigatório)
        </p>

        <div className="flex w-full max-w-[827px] flex-col items-center gap-3">
          <input
            type="text"
            inputMode="none"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome"
            className="px-[28.8px] text-center text-[25.92px] outline-none placeholder:font-medium placeholder:text-[37px] placeholder:tracking-[3.7px] placeholder:text-[#3D2A1A]"
            style={{
              width: 827,
              maxWidth: "100%",
              height: 58,
              backgroundColor: "#E2B291",
              borderRadius: 4,
              opacity: 1,
              color: cores.textoEscuro,
            }}
          />
          <input
            type="email"
            inputMode="none"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="E-mail"
            className="px-[28.8px] text-center text-[25.92px] outline-none placeholder:font-medium placeholder:text-[37px] placeholder:tracking-[3.7px] placeholder:text-[#3D2A1A]"
            style={{
              width: 827,
              maxWidth: "100%",
              height: 58,
              backgroundColor: "#E2B291",
              borderRadius: 4,
              opacity: 1,
              color: cores.textoEscuro,
            }}
          />
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
