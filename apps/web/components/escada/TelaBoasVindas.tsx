import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

// Valores convertidos do canvas XD 1920×1080 para vw/vh

export function TelaBoasVindas({ onDeixarDepoimento }: { onDeixarDepoimento: () => void }) {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center gap-[2.6vh] px-8 text-center"
      style={{ backgroundColor: cores.fundoEscuro }}
    >
      <Logo variante="clara" />

      <h1 className="text-[2.29vw] tracking-widest text-white text-center leading-snug">
        <span className="block whitespace-nowrap">
          <span className="font-bold">SEJA BEM-VINDO(A) AO </span><span className="font-extrabold">MUSEU DO SERTÃO,</span>
        </span>
        <span className="block font-medium">EM PIRANHAS, ALAGOAS.</span>
      </h1>

      <div
        className="flex items-center justify-center rounded-md px-[2.08vw]"
        style={{
          width: "66.1vw",
          minHeight: "22.3vh",
          backgroundColor: cores.caixaEscura,
        }}
      >
        <p className="text-white text-center" style={{ fontSize: "2.08vw", letterSpacing: "3.97px" }}>
          <strong>Grave um vídeo</strong> ou <strong>tire uma foto</strong> e deixe sua mensagem. É simples, rápido e
          sua lembrança passa a fazer parte da história deste museu.
        </p>
      </div>

      <button
        onClick={onDeixarDepoimento}
        className="font-bold cursor-pointer"
        style={{
          backgroundColor: "#FFB50B",
          color: "#491F0A",
          letterSpacing: "6.38px",
          fontSize: "2.19vw",
          width: "45.1vw",
          height: "12.69vh",
          borderRadius: "3.59vw",
        }}
      >
        DEIXAR DEPOIMENTO
      </button>
    </div>
  );
}
