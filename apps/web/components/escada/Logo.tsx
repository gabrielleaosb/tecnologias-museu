import Image from "next/image";

// Tamanhos em vw baseados no canvas 1920px do XD
// Horizontal: 320px → 16.67vw | Vertical: 167px → 8.72vw

export function Logo({ variante = "escura", style }: { variante?: "clara" | "escura" | "escura1-vertical" | "cinza-vertical"; style?: React.CSSProperties }) {
  if (variante === "escura1-vertical") {
    return (
      <Image
        src="/icons/escada/logo-escura1-vertical.png"
        alt="Museu do Sertão - Piranhas, AL"
        width={239}
        height={251}
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
        width={239}
        height={251}
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
      width={200}
      height={70}
      style={{ width: "16.67vw", height: "auto", ...style }}
      priority
    />
  );
}
