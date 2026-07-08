import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";

export function TelaBoasVindas({ onDeixarDepoimento }: { onDeixarDepoimento: () => void }) {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center gap-10 px-8 text-center"
      style={{ backgroundColor: cores.fundoEscuro }}
    >
      <Logo variante="clara" />

      <h1 className="max-w-2xl text-2xl font-extrabold tracking-wide text-white sm:text-3xl">
        SEJA BEM-VINDO(A) AO <span className="font-black">MUSEU DO SERTÃO</span>, EM PIRANHAS, ALAGOAS.
      </h1>

      <div className="max-w-xl rounded-md px-6 py-6" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
        <p className="text-lg text-white sm:text-xl">
          <strong>Grave um vídeo</strong> ou <strong>tire uma foto</strong> e deixe sua mensagem. É simples, rápido e
          sua lembrança passa a fazer parte da história deste museu.
        </p>
      </div>

      <button
        onClick={onDeixarDepoimento}
        className="rounded-full px-12 py-5 text-xl font-extrabold tracking-wide cursor-pointer"
        style={{ backgroundColor: cores.laranja, color: cores.textoEscuro }}
      >
        DEIXAR DEPOIMENTO
      </button>
    </div>
  );
}
