import Image from "next/image";
import { cores } from "@/lib/escada/cores";
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
    <div className="flex h-screen w-screen flex-col justify-between p-8 sm:p-12" style={{ backgroundColor: cores.fundoClaro }}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Image
          src={tipo === "video" ? "/icons/escada/play.png" : "/icons/escada/foto.png"}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14"
        />

        <h1 className="max-w-lg text-xl font-extrabold sm:text-2xl" style={{ color: cores.textoEscuro }}>
          Você optou por {tipo === "video" ? "gravar um vídeo" : "tirar uma foto"},
          <br />
          <span className="font-normal">siga as instruções, são apenas algumas etapas.</span>
        </h1>

        <p className="text-lg" style={{ color: cores.textoEscuro }}>
          Informações básicas (obrigatório)
        </p>

        <div className="flex w-full max-w-md flex-col gap-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome"
            className="rounded-md px-5 py-3 text-center text-lg outline-none"
            style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="E-mail"
            className="rounded-md px-5 py-3 text-center text-lg outline-none"
            style={{ backgroundColor: cores.botaoTan, color: cores.textoEscuro }}
          />
        </div>
      </div>

      <Navegacao onAnterior={onAnterior} onProximo={onProximo} proximoHabilitado={habilitado} />
    </div>
  );
}
