import Image from "next/image";

export function Logo({ variante = "escura" }: { variante?: "clara" | "escura" | "escura1-vertical" }) {
  if (variante === "escura1-vertical") {
    return (
      <Image
        src="/icons/escada/logo-escura1-vertical.png"
        alt="Museu do Sertão - Piranhas, AL"
        width={239}
        height={251}
        className="h-auto w-[143.52px] sm:w-[167.44px]"
        priority
      />
    );
  }

  const src = variante === "clara" ? "/icons/escada/logo-clara-horizontal.png" : "/icons/escada/logo-escura-horizontal.png";

  return <Image src={src} alt="Museu do Sertão - Piranhas, AL" width={200} height={70} className="h-auto w-40 sm:w-48" priority />;
}
