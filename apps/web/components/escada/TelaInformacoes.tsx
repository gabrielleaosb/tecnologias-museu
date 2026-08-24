import Image from "next/image";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";

// Esta é a tela de referência dos tokens em lib/escada/estilos.ts.

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

  const estiloInput = ESCADA.campo;

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
          <span className="block whitespace-nowrap font-bold">
            Você optou por {tipo === "video" ? "gravar um vídeo" : "tirar uma foto"},
          </span>
          <span className="block whitespace-nowrap font-medium">siga as instruções, são apenas algumas etapas.</span>
        </h1>

        <p className="font-medium" style={ESCADA.texto.secundario}>
          Informações básicas (obrigatório)
        </p>

        <div className="flex flex-col items-center" style={{ gap: ESCADA.espacoEntreCampos }}>
          {/*
            `inputMode="none"` nos dois campos: quem digita é o teclado do app
            (components/TecladoVirtual.tsx), e sem isto o teclado do sistema abriria
            por cima dele. O campo continua focável e editável normalmente.
          */}
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Nome"
            inputMode="none"
            className="text-center outline-none placeholder:font-medium placeholder:text-[#3D2A1A]"
            style={estiloInput}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="E-mail"
            inputMode="none"
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
        {...ESCADA.navegacao}
      />
    </div>
  );
}
