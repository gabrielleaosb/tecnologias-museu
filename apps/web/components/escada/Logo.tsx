import Image from "next/image";

// Tamanhos em vw baseados no canvas 1920px do XD
// Horizontal: 320px → 16.67vw | Vertical: 167px → 8.72vw
//
// `width`/`height` são as dimensões REAIS dos arquivos, e não o tamanho em que a logo
// aparece na tela. É por elas que o next/image decide a resolução a servir: com os
// 200×70 que estavam aqui, ele entregava uma imagem de ~200px de largura, que em
// telas onde a logo é desenhada maior — a de boas-vindas, a 26vw, passa de 500px —
// aparecia esticada e borrada. O tamanho de exibição continua vindo do `style`.
const HORIZONTAL = { width: 1401, height: 601 };
const VERTICAL = { width: 801, height: 841 };

export function Logo({ variante = "escura", style }: { variante?: "clara" | "escura" | "escura1-vertical" | "escura2-vertical" | "cinza-vertical"; style?: React.CSSProperties }) {
  if (variante === "escura1-vertical" || variante === "escura2-vertical") {
    // As duas verticais só diferem na cor do letreiro: a 1 sai em marrom médio, a 2
    // em marrom escuro. A galeria da Sala 7 usa a 2.
    return (
      <Image
        src={`/icons/escada/logo-${variante === "escura2-vertical" ? "escura2" : "escura1"}-vertical.png`}
        alt="Museu do Sertão - Piranhas, AL"
        {...VERTICAL}
        style={{ width: "8.72vw", height: "auto", ...style }}
        priority
      />
    );
  }

  if (variante === "cinza-vertical") {
    return (
      <Image
        src="/icons/escada/logo-cinza-vertical.png"
        alt="Museu do Sertão - Piranhas, AL"
        {...VERTICAL}
        style={{ width: "8.72vw", height: "auto", ...style }}
        priority
      />
    );
  }

  const src = variante === "clara" ? "/icons/escada/logo-clara-horizontal.png" : "/icons/escada/logo-escura-horizontal.png";

  return (
    <Image
      src={src}
      alt="Museu do Sertão - Piranhas, AL"
      {...HORIZONTAL}
      style={{ width: "16.67vw", height: "auto", ...style }}
      priority
    />
  );
}
