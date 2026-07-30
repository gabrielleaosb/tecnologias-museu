"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reconhecerComando, type Comando } from "@/lib/sala8/reconhecimentoVoz";

type Tentativa = {
  hora: string;
  transcricao: string;
  comando: Comando | null;
};

const MENSAGENS_ERRO: Record<string, string> = {
  "no-speech": "Nenhuma fala detectada — silêncio no período de escuta.",
  "not-allowed": "Permissão de microfone negada pelo navegador.",
  "audio-capture": "Nenhum microfone encontrado.",
  network: "Erro de rede durante o reconhecimento.",
  aborted: "Reconhecimento interrompido.",
};

export default function Sala8TesteVozPage() {
  const [suportado, setSuportado] = useState<boolean | null>(null);
  const [ouvindo, setOuvindo] = useState(false);
  const [modoContinuo, setModoContinuo] = useState(false);
  const [interina, setInterina] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [tentativas, setTentativas] = useState<Tentativa[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const modoContinuoRef = useRef(modoContinuo);
  modoContinuoRef.current = modoContinuo;

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSuportado(Boolean(Ctor));
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setErro(null);
      setInterina("");
      setOuvindo(true);
    };

    recognition.onresult = (evento) => {
      const resultado = evento.results[evento.results.length - 1];
      const transcricao = resultado[0].transcript;

      if (!resultado.isFinal) {
        setInterina(transcricao);
        return;
      }

      const comando = reconhecerComando(transcricao);
      setInterina("");
      setTentativas((atual) => [
        { hora: new Date().toLocaleTimeString("pt-BR"), transcricao, comando },
        ...atual,
      ]);
    };

    recognition.onerror = (evento) => {
      setErro(MENSAGENS_ERRO[evento.error] ?? `Erro: ${evento.error}`);
    };

    recognition.onend = () => {
      setOuvindo(false);
      if (modoContinuoRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, []);

  const iniciar = useCallback(() => {
    recognitionRef.current?.start();
  }, []);

  const parar = useCallback(() => {
    setModoContinuo(false);
    recognitionRef.current?.stop();
  }, []);

  if (suportado === null) return null;

  if (!suportado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-8">
        <p className="text-xl text-center max-w-md">
          Este navegador não suporta a Web Speech API. Use Chrome/Chromium (o mesmo usado no kiosk).
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Sala 8 — Protótipo de reconhecimento de voz</h1>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={ouvindo ? parar : iniciar}
          className={`w-40 h-40 rounded-full text-lg font-semibold transition-colors ${
            ouvindo ? "bg-red-600 animate-pulse" : "bg-amber-500 hover:bg-amber-400"
          }`}
        >
          {ouvindo ? "Ouvindo..." : "Toque para falar"}
        </button>

        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={modoContinuo}
            onChange={(e) => {
              setModoContinuo(e.target.checked);
              if (e.target.checked && !ouvindo) iniciar();
            }}
          />
          Modo contínuo (reinicia sozinho após cada escuta — simula uso hands-free)
        </label>

        {interina && <p className="text-neutral-400 italic">"{interina}"</p>}
        {erro && <p className="text-red-400">{erro}</p>}
      </div>

      <section className="w-full max-w-xl">
        <h2 className="text-sm uppercase tracking-wide text-neutral-400 mb-2">
          Histórico ({tentativas.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {tentativas.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-neutral-800 rounded px-4 py-2 text-sm"
            >
              <span className="text-neutral-300">
                {t.hora} — "{t.transcricao}"
              </span>
              <span className={t.comando ? "text-green-400" : "text-red-400"}>
                {t.comando ?? "não reconhecido"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
