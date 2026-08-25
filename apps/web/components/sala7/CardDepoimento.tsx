import type { DepoimentoPublico } from "@/lib/socket/eventos";
import { galeria, g, PESO } from "@/lib/sala7/medidas";

/**
 * Card da grade: a mídia preenche o retângulo 16:9 inteiro, com o anel de tipo no
 * alto à esquerda e o nome do visitante embaixo.
 *
 * O anel e o ícone são desenhados aqui, e não trazidos de `public/icons`: os PNGs da
 * Escada são um disco salmão com o símbolo escuro dentro (é assim que a cabine usa),
 * enquanto no protótipo da galeria o que aparece é o contorno vazado em branco sobre
 * a foto. Repintar o PNG por filtro não produziria o vazado.
 */
export function CardDepoimento({ depoimento, onClick }: { depoimento: DepoimentoPublico; onClick: () => void }) {
  const { card } = galeria;

  return (
    <button
      onClick={onClick}
      className="relative w-full cursor-pointer overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      {depoimento.tipo === "video" ? (
        <video src={depoimento.arquivoUrl} muted preload="metadata" className="h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={depoimento.arquivoUrl} alt="" className="h-full w-full object-cover" />
      )}

      <span
        className="absolute flex items-center justify-center rounded-full"
        style={{
          left: g(card.anel.recuo),
          top: g(card.anel.recuo),
          width: g(card.anel.tamanho),
          height: g(card.anel.tamanho),
          border: `${g(card.anel.traco)} solid #FFFFFF`,
        }}
      >
        {depoimento.tipo === "video" ? (
          <svg viewBox="0 0 24 24" style={{ width: "48%" }} fill="#FFFFFF" aria-hidden>
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: "52%" }} fill="none" stroke="#FFFFFF" strokeWidth="2" aria-hidden>
            <path d="M3 8.5h3.5L8 6.5h8l1.5 2H21v10H3z" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
        )}
      </span>

      <span
        className="absolute text-left uppercase"
        style={{
          left: g(card.nome.recuo),
          bottom: g(card.nome.base),
          color: "#FFFFFF",
          fontSize: g(card.nome.texto),
          fontWeight: PESO.bold,
          letterSpacing: g(card.nome.tracking),
          lineHeight: 1,
        }}
      >
        {depoimento.nome}
      </span>
    </button>
  );
}
