import Image from "next/image";
import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { coresSala7 } from "@/lib/sala7/cores";
import { detalhe, d, UNIDADE_DETALHE, PESO } from "@/lib/sala7/medidas";
import { Logo } from "@/components/escada/Logo";
import { VideoDepoimento } from "@/components/sala7/VideoDepoimento";

interface TelaDetalheProps {
  depoimento: DepoimentoPublico;
  jaPrestigiou: boolean;
  onVoltar: () => void;
  onAnterior: () => void;
  onProximo: () => void;
  onPrestigiar: () => void;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Seta de navegação: só o sinal, sem botão redondo, como no protótipo. */
function Seta({ sentido, onClick }: { sentido: "anterior" | "proximo"; onClick: () => void }) {
  const { seta } = detalhe;
  return (
    <button
      onClick={onClick}
      className="absolute flex cursor-pointer items-center justify-center"
      style={{
        left: sentido === "anterior" ? d(seta.esquerda) : d(seta.direita),
        top: d(seta.y),
        width: d(seta.largura),
        height: d(seta.altura),
      }}
      aria-label={sentido === "anterior" ? "Depoimento anterior" : "Próximo depoimento"}
    >
      {/*
        A `viewBox` tem a proporção do sinal medido (28×42) e o traço encosta nas
        quatro bordas dela. Com uma `viewBox` quadrada genérica o desenho ocupava um
        terço da caixa e a seta saía miúda, ainda que a caixa estivesse no tamanho
        certo.
      */}
      <svg viewBox="0 0 28 42" className="h-full w-full" fill="none" stroke={coresSala7.texto} strokeWidth="6" aria-hidden>
        <path
          d={sentido === "anterior" ? "M25 3L3 21l22 18" : "M3 3l22 18-22 18"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * Tela de detalhe de um depoimento — p. 2 e 3 do protótipo (vídeo e foto).
 *
 * Diferente da galeria, esta é uma composição fechada de 16:9: tudo é posicionado por
 * coordenada do canvas 1920×1080 e a tela não rola. Ver `UNIDADE_DETALHE`.
 */
export function TelaDetalhe({
  depoimento,
  jaPrestigiou,
  onVoltar,
  onAnterior,
  onProximo,
  onPrestigiar,
}: TelaDetalheProps) {
  const { voltar, logo, midia, recado, origem, rodapeMidia, prestigio } = detalhe;

  return (
    <div
      className="flex h-screen w-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: coresSala7.fundo, ["--u7" as string]: UNIDADE_DETALHE }}
    >
      <div className="relative" style={{ width: d(1920), height: d(1080) }}>
        <button
          onClick={onVoltar}
          className="absolute flex cursor-pointer items-center justify-center rounded-full"
          style={{
            left: d(voltar.x),
            top: d(voltar.y),
            width: d(voltar.tamanho),
            height: d(voltar.tamanho),
            backgroundColor: coresSala7.texto,
          }}
          aria-label="Voltar para a galeria"
        >
          <svg
            viewBox="0 0 36 57"
            style={{ width: d(voltar.seta.largura), height: d(voltar.seta.altura) }}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="8"
            aria-hidden
          >
            <path d="M32 4L4 28.5l28 24.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <Logo
          variante="escura"
          style={{ position: "absolute", left: d(logo.x), top: d(logo.y), width: d(logo.largura) }}
        />

        <div
          className="absolute overflow-hidden bg-black"
          style={{ left: d(midia.x), top: d(midia.y), width: d(midia.largura), height: d(midia.altura) }}
        >
          {depoimento.tipo === "video" ? (
            <VideoDepoimento src={depoimento.arquivoUrl} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={depoimento.arquivoUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        {/*
          Nome e data ficam recuados das bordas da mídia, e não colados nelas — é o
          que o protótipo mostra, com ~20px de folga de cada lado.
        */}
        <div
          className="absolute flex items-baseline justify-between"
          style={{
            left: d(midia.x + rodapeMidia.recuo),
            top: d(rodapeMidia.y),
            width: d(midia.largura - rodapeMidia.recuo * 2),
            color: coresSala7.texto,
          }}
        >
          <span style={{ fontSize: d(rodapeMidia.nome), fontWeight: PESO.medium }}>{depoimento.nome}</span>
          <span style={{ fontSize: d(rodapeMidia.data), letterSpacing: d(rodapeMidia.tracking) }}>
            {formatarData(depoimento.criadoEm)}
          </span>
        </div>

        <div
          className="absolute overflow-hidden"
          style={{
            left: d(recado.x),
            top: d(recado.y),
            width: d(recado.largura),
            height: d(recado.altura),
            backgroundColor: coresSala7.recadoCaixa,
            padding: `${d(recado.recuo.topo)} ${d(recado.recuo.lados)}`,
          }}
        >
          <p
            className="uppercase"
            style={{
              color: coresSala7.textoClaro,
              fontSize: d(recado.titulo),
              fontWeight: PESO.bold,
              letterSpacing: "0.06em",
            }}
          >
            Deixou esta mensagem:
          </p>
          <p
            style={{
              marginTop: d(12),
              color: coresSala7.recadoTexto,
              fontSize: d(recado.texto),
              lineHeight: `${recado.entrelinha / recado.texto}`,
            }}
          >
            {depoimento.texto ?? ""}
          </p>
        </div>

        <Image
          src="/icons/escada/local.png"
          alt=""
          width={401}
          height={401}
          className="absolute"
          style={{ left: d(origem.alfinete.x), top: d(origem.alfinete.y), width: d(origem.alfinete.largura), height: "auto" }}
        />
        <div
          className="absolute text-center uppercase"
          style={{
            left: d(origem.texto.x),
            top: d(origem.texto.y),
            width: d(origem.texto.largura),
            color: coresSala7.texto,
            fontSize: d(origem.texto.corpo),
            letterSpacing: d(origem.texto.tracking),
            lineHeight: `${origem.texto.entrelinha / origem.texto.corpo}`,
          }}
        >
          <p style={{ fontWeight: PESO.heavy }}>Veio de</p>
          <p style={{ fontWeight: PESO.book }}>{depoimento.estado}</p>
          <p style={{ fontWeight: PESO.book }}>{depoimento.pais}</p>
        </div>

        <button
          onClick={onPrestigiar}
          disabled={jaPrestigiou}
          className="absolute flex cursor-pointer items-center disabled:cursor-default"
          style={{ left: d(prestigio.x), top: d(prestigio.y), gap: d(prestigio.espaco), color: coresSala7.texto }}
        >
          {/* Dois dígitos fixos, como o "00" do protótipo. */}
          <span style={{ fontSize: d(prestigio.numero), fontWeight: PESO.heavy }}>
            {String(depoimento.prestigios).padStart(2, "0")}
          </span>
          <Image
            src={jaPrestigiou ? "/icons/escada/prestigiar-aceso.png" : "/icons/escada/prestigiar-apagado.png"}
            alt=""
            width={401}
            height={401}
            style={{ width: d(prestigio.mao), height: "auto" }}
          />
          <span style={{ fontSize: d(prestigio.rotulo), fontWeight: PESO.medium }}>Prestigiar</span>
        </button>

        <Seta sentido="anterior" onClick={onAnterior} />
        <Seta sentido="proximo" onClick={onProximo} />
      </div>
    </div>
  );
}
