import Image from "next/image";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { Navegacao } from "@/components/escada/Navegacao";
import { SeletorOpcao } from "@/components/escada/SeletorOpcao";
import { ESTADOS_BRASIL } from "@/lib/escada/estados";
import { PAISES, PAIS_PADRAO } from "@/lib/escada/paises";

interface TelaOrigemProps {
  tipo: "video" | "foto";
  nome: string;
  pais: string;
  estado: string;
  onPaisChange: (v: string) => void;
  onEstadoChange: (v: string) => void;
  onAnterior: () => void;
  onProximo: () => void;
}

export function TelaOrigem({ tipo, nome, pais, estado, onPaisChange, onEstadoChange, onAnterior, onProximo }: TelaOrigemProps) {
  // A lista de estados só vale para o Brasil. Para qualquer outro país o campo fica
  // desabilitado e some da validação — senão o PRÓXIMO nunca habilitaria.
  const exigeEstado = pais === PAIS_PADRAO;
  const habilitado = pais.trim().length > 0 && (!exigeEstado || estado.trim().length > 0);

  function selecionarPais(novoPais: string) {
    onPaisChange(novoPais);
    if (novoPais !== PAIS_PADRAO && estado) onEstadoChange("");
  }

  const estiloInput: React.CSSProperties = {
    ...ESCADA.campo,
    width: ESCADA.origem.campo,
    maxWidth: "100%",
    textAlign: "center",
  };

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
            Olá {nome || "visitante"}, estamos prestes a começar.
          </span>
          <span className="block whitespace-nowrap font-medium">Antes disso, conte pra nós:</span>
        </h1>

        <p className="font-medium" style={ESCADA.texto.secundario}>
          De onde você veio?
        </p>

        <div className="flex flex-col" style={{ gap: "0.63vw" }}>
          <label className="flex items-center" style={{ gap: ESCADA.origem.espaco }}>
            <span className="font-bold text-left" style={{ ...ESCADA.texto.corpo, width: ESCADA.origem.rotulo }}>
              PAÍS
            </span>
            <SeletorOpcao
              valor={pais}
              opcoes={PAISES}
              onChange={selecionarPais}
              placeholder="Brasil"
              titulo="De qual país você veio?"
              colunas={4}
              larguraColuna="15vw"
              estilo={estiloInput}
            />
          </label>
          <label className="flex items-center" style={{ gap: ESCADA.origem.espaco }}>
            <span className="font-bold text-left" style={{ ...ESCADA.texto.corpo, width: ESCADA.origem.rotulo }}>
              ESTADO
            </span>
            <SeletorOpcao
              valor={estado}
              opcoes={ESTADOS_BRASIL}
              onChange={onEstadoChange}
              placeholder="Alagoas"
              titulo="De qual estado você veio?"
              colunas={3}
              larguraColuna="18vw"
              desabilitado={!exigeEstado}
              estilo={estiloInput}
            />
          </label>
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
