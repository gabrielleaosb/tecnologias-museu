"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FRASE_SUGERIDA,
  reconhecerEntreAlternativas,
  type Comando,
} from "@/lib/sala8/reconhecimentoVoz";

type Tentativa = {
  hora: string;
  transcricao: string;
  /** Demais hipóteses do reconhecedor, da 2ª em diante (maxAlternatives). */
  alternativas: string[];
  confianca: number | null;
  comando: Comando | null;
  /** Fala captada (houve resultado interino) mas descartada sem resultado final. */
  descartada?: boolean;
  /** Aceita na hipótese interina, sem esperar o Chrome fechar a frase. */
  interina?: boolean;
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
  const [modoRapido, setModoRapido] = useState(true);
  const [interina, setInterina] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [tentativas, setTentativas] = useState<Tentativa[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const modoContinuoRef = useRef(modoContinuo);
  modoContinuoRef.current = modoContinuo;
  const modoRapidoRef = useRef(modoRapido);
  modoRapidoRef.current = modoRapido;
  /** Última transcrição interina da escuta atual, para diagnosticar fala descartada. */
  const ultimaInterinaRef = useRef("");
  const houveResultadoFinalRef = useRef(false);
  /** Abortamos de propósito para limpar o buffer após aceitar um comando. */
  const reiniciandoRef = useRef(false);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSuportado(Boolean(Ctor));
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = false;
    // O Chrome frequentemente coloca a transcrição correta fora da 1ª hipótese
    // em palavras curtas ("um"); pedimos várias e casamos contra todas.
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setErro(null);
      setInterina("");
      ultimaInterinaRef.current = "";
      houveResultadoFinalRef.current = false;
      setOuvindo(true);
    };

    recognition.onresult = (evento) => {
      const resultado = evento.results[evento.results.length - 1];
      const transcricao = resultado[0].transcript;

      if (!resultado.isFinal) {
        ultimaInterinaRef.current = transcricao;
        setInterina(transcricao);

        // Vocabulário fechado: assim que um comando válido aparece na hipótese
        // interina, não há por que esperar o Chrome fechar a frase — ele não
        // fecha em monossílabo ("um") e acaba grudando a próxima palavra na
        // mesma transcrição. Aceitamos na hora e reiniciamos para limpar o
        // buffer, senão a palavra velha reaparece no próximo resultado.
        if (modoRapidoRef.current) {
          const comandoInterino = reconhecerEntreAlternativas([transcricao]);
          if (comandoInterino) {
            houveResultadoFinalRef.current = true;
            setInterina("");
            setTentativas((atual) => [
              {
                hora: new Date().toLocaleTimeString("pt-BR"),
                transcricao,
                alternativas: [],
                confianca: null,
                comando: comandoInterino,
                interina: true,
              },
              ...atual,
            ]);
            reiniciandoRef.current = true;
            recognition.abort();
          }
        }
        return;
      }

      const alternativas: string[] = [];
      for (let i = 0; i < resultado.length; i++) alternativas.push(resultado[i].transcript);

      const comando = reconhecerEntreAlternativas(alternativas);
      houveResultadoFinalRef.current = true;
      setInterina("");
      setTentativas((atual) => [
        {
          hora: new Date().toLocaleTimeString("pt-BR"),
          transcricao,
          alternativas: alternativas.slice(1),
          confianca: typeof resultado[0].confidence === "number" ? resultado[0].confidence : null,
          comando,
        },
        ...atual,
      ]);
    };

    recognition.onerror = (evento) => {
      // "aborted" logo após aceitarmos um comando é a nossa própria limpeza de
      // buffer, não um erro que interesse ao operador.
      if (evento.error === "aborted" && reiniciandoRef.current) return;
      setErro(MENSAGENS_ERRO[evento.error] ?? `Erro: ${evento.error}`);
    };

    recognition.onend = () => {
      setOuvindo(false);

      if (reiniciandoRef.current) {
        reiniciandoRef.current = false;
        setInterina("");
        if (modoContinuoRef.current) recognition.start();
        return;
      }

      // Fala foi captada (apareceu texto interino) mas o Chrome encerrou sem
      // emitir resultado final — foi descartada por baixa confiança. É o
      // sintoma típico de monossílabos como "um".
      if (!houveResultadoFinalRef.current && ultimaInterinaRef.current) {
        const descartada = ultimaInterinaRef.current;
        ultimaInterinaRef.current = "";
        setTentativas((atual) => [
          {
            hora: new Date().toLocaleTimeString("pt-BR"),
            transcricao: descartada,
            alternativas: [],
            confianca: null,
            comando: null,
            descartada: true,
          },
          ...atual,
        ]);
      }

      setInterina("");
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

      <div className="text-center">
        <p className="text-sm text-neutral-400 mb-2">Diga uma destas:</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {(Object.keys(FRASE_SUGERIDA) as Comando[]).map((comando) => (
            <li key={comando} className="bg-neutral-800 rounded px-3 py-1 text-sm">
              "{FRASE_SUGERIDA[comando]}"
              <span className="text-neutral-500"> → {comando}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-neutral-500 mt-2 max-w-md">
          Números são pedidos como "número um" e não "um" solto — o Chrome não transcreve
          monossílabo isolado. Falar só o número ainda é aceito de 2 a 5.
        </p>
      </div>

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

        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={modoRapido}
            onChange={(e) => setModoRapido(e.target.checked)}
          />
          Aceitar na hipótese interina (não espera o Chrome fechar a frase)
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
            <li key={i} className="bg-neutral-800 rounded px-4 py-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-300">
                  {t.hora} — "{t.transcricao}"
                  {t.confianca !== null && (
                    <span className="text-neutral-500"> ({(t.confianca * 100).toFixed(0)}%)</span>
                  )}
                </span>
                <span
                  className={
                    t.comando ? "text-green-400" : t.descartada ? "text-amber-400" : "text-red-400"
                  }
                >
                  {t.comando ?? (t.descartada ? "descartada pelo Chrome" : "não reconhecido")}
                  {t.interina && <span className="text-neutral-500 text-xs"> (interina)</span>}
                </span>
              </div>

              {t.descartada && (
                <p className="text-xs text-amber-500/80 mt-1">
                  O Chrome captou essa fala mas encerrou sem resultado final (baixa confiança).
                </p>
              )}

              {t.alternativas.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  outras hipóteses: {t.alternativas.map((a) => `"${a}"`).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
