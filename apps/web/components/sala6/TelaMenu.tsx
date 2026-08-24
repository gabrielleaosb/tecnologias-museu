import { coresSala6 } from "@/lib/sala6/cores";
import { d, PESO, TRACKING } from "@/lib/sala6/medidas";
import { Botao } from "@/components/sala6/Botao";
import { Casa } from "@/components/sala6/Casa";
import { LogoSala6 } from "@/components/sala6/LogoSala6";

interface TelaMenuProps {
  onNovoJogo: () => void;
  onRanking: () => void;
  onVoltar: () => void;
}

/** Página 1 do PDF. */
export function TelaMenu({ onNovoJogo, onRanking, onVoltar }: TelaMenuProps) {
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: coresSala6.marrom }}>
      <Casa variante="voltarBege" x={94} y={79} onClick={onVoltar} rotuloAcessivel="Voltar" />
      {/*
        Marrom em opacidade cheia. A bege que estava aqui aparecia a 45%, mas o mesmo
        rebaixamento aplicado à marrom a apagava contra o fundo escuro — os dois tons
        ficam próximos demais. Sendo a marrom, ela precisa da opacidade inteira para
        se ler.
      */}
      <LogoSala6 variante="marrom" x={1672} y={72} largura={166} />

      <h1
        className="absolute w-full text-center"
        style={{
          top: d(109),
          color: coresSala6.bege,
          fontSize: d(83.4),
          fontWeight: PESO.bold,
          letterSpacing: TRACKING.largo,
          lineHeight: 1.25,
        }}
      >
        JOGO DA MEMÓRIA
      </h1>

      <p
        className="absolute w-full text-center"
        style={{
          top: d(235),
          color: coresSala6.bege,
          fontSize: d(35.6),
          fontWeight: PESO.demi,
          letterSpacing: TRACKING.extra,
          // A entreletra do CSS entra também depois da última letra, o que empurra a
          // linha meio caractere para a esquerda. Em 0,5em isso é visível, então o
          // deslocamento é devolvido aqui.
          textIndent: TRACKING.extra,
          lineHeight: 1.25,
        }}
      >
        PALEONTOLOGIA E BIOMA
      </p>

      <div
        className="absolute flex flex-col justify-center"
        style={{
          left: d(284),
          top: d(355),
          width: d(1351),
          height: d(274),
          borderRadius: d(66),
          backgroundColor: coresSala6.caixaTexto,
          padding: `0 ${d(121)}`,
        }}
      >
        <p
          style={{
            color: coresSala6.ocre,
            fontSize: d(31.3),
            fontWeight: PESO.bold,
            letterSpacing: TRACKING.normal,
            lineHeight: 1.44,
            textAlign: "center",
          }}
        >
          Você consegue encontrar os pares?
        </p>
        <p
          style={{
            color: coresSala6.bege,
            fontSize: d(31.3),
            fontWeight: PESO.medium,
            letterSpacing: TRACKING.normal,
            lineHeight: 1.44,
          }}
        >
          Neste jogo, cada imagem representa um elemento da história da vida e da natureza.
          Encontre as imagens iguais e descubra animais, fósseis e elementos dos diferentes
          biomas. <strong style={{ fontWeight: PESO.bold }}>Observe, memorize e divirta-se
          enquanto aprende!</strong>
        </p>
      </div>

      <Botao
        onClick={onNovoJogo}
        fundo={coresSala6.ocre}
        style={{ position: "absolute", left: d(732), top: d(693) }}
      >
        NOVO JOGO
      </Botao>

      <Botao
        onClick={onRanking}
        fundo={coresSala6.bege}
        style={{ position: "absolute", left: d(732), top: d(866) }}
      >
        RANKING GERAL
      </Botao>
    </div>
  );
}
