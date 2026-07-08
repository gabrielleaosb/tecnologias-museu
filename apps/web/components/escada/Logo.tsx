import Image from "next/image";

export function Logo({ variante = "escura" }: { variante?: "clara" | "escura" }) {
  const src = variante === "clara" ? "/icons/escada/logo-clara-horizontal.png" : "/icons/escada/logo-escura-horizontal.png";

  return <Image src={src} alt="Museu do Sertão - Piranhas, AL" width={200} height={70} className="h-auto w-40 sm:w-48" priority />;
}
