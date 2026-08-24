import { useCallback, useEffect, useRef, useState } from "react";

const DURACAO_MAXIMA_VIDEO_S = 60;
const CONTAGEM_REGRESSIVA_S = 5;

export function useCamera(tipo: "foto" | "video") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contagemRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [streamPronto, setStreamPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [contagemRegressiva, setContagemRegressiva] = useState<number | null>(null);
  const [gravando, setGravando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [midiaBlob, setMidiaBlob] = useState<Blob | null>(null);
  const [midiaUrl, setMidiaUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    navigator.mediaDevices
      /**
       * Pede 1280×720. Com `video: true` puro a câmera entrega o padrão dela, que
       * costuma ser 640×480 — pouco para uma foto que vai ser exibida na TV de 43"
       * da Sala 7. `ideal` não é exigência: se a webcam não alcançar, ela entrega o
       * que puder em vez de falhar.
       */
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: tipo === "video",
      })
      .then((stream) => {
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStreamPronto(true);
      })
      .catch(() => setErro("Não foi possível acessar a câmera. Verifique as permissões do dispositivo."));

    return () => {
      cancelado = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      if (contagemRef.current) clearInterval(contagemRef.current);
    };
  }, [tipo]);

  const limparIntervalo = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  const pararGravacao = useCallback(() => {
    limparIntervalo();
    setGravando(false);
    gravadorRef.current?.stop();
  }, []);

  const iniciarGravacaoReal = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    // Sem bitrate explícito o navegador escolhe conforme a resolução da webcam,
    // e o tamanho do arquivo deixa de ser previsível. Travado aqui para que
    // 60s caibam com folga no teto de upload (TAMANHO_MAXIMO_UPLOAD_BYTES).
    const gravador = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 2_000_000,
      audioBitsPerSecond: 128_000,
    });
    gravador.ondataavailable = (evento) => {
      if (evento.data.size > 0) chunksRef.current.push(evento.data);
    };
    gravador.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setMidiaBlob(blob);
      setMidiaUrl(URL.createObjectURL(blob));
    };
    gravador.start();
    gravadorRef.current = gravador;

    setGravando(true);
    setSegundos(0);

    // O tempo decorrido é contado numa variável do fechamento, e o `setSegundos`
    // recebe um valor pronto. Antes o incremento e a parada automática moravam
    // dentro do atualizador de estado — e o React chama atualizadores duas vezes em
    // desenvolvimento, para detectar impureza, o que disparava a parada em duplicidade.
    let decorridos = 0;
    intervaloRef.current = setInterval(() => {
      decorridos += 1;
      setSegundos(decorridos);
      if (decorridos >= DURACAO_MAXIMA_VIDEO_S) pararGravacao();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciarGravacao = useCallback(() => {
    // Já em contagem ou já gravando: ignora. Sem esta guarda, um toque duplo no
    // GRAVAR abria duas contagens e, no fim delas, dois cronômetros.
    if (contagemRef.current || intervaloRef.current) return;

    /**
     * A contagem vive numa variável do fechamento, e não dentro do atualizador de
     * estado.
     *
     * Era daqui que vinha o cronômetro correndo de dois em dois e mais rápido que um
     * segundo: `clearInterval` e o início da gravação estavam dentro do atualizador
     * de `setContagemRegressiva`, e o React executa atualizadores duas vezes em
     * desenvolvimento para checar se são puros. A gravação começava duas vezes, cada
     * uma com seu próprio intervalo de 1s, e os dois somavam no mesmo contador.
     */
    let restante = CONTAGEM_REGRESSIVA_S;
    setContagemRegressiva(restante);

    contagemRef.current = setInterval(() => {
      restante -= 1;
      if (restante > 0) {
        setContagemRegressiva(restante);
        return;
      }
      if (contagemRef.current) {
        clearInterval(contagemRef.current);
        contagemRef.current = null;
      }
      setContagemRegressiva(null);
      iniciarGravacaoReal();
    }, 1000);
  }, [iniciarGravacaoReal]);


  const tirarFotoReal = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      setMidiaBlob(blob);
      setMidiaUrl(URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  }, []);

  const tirarFoto = useCallback(() => {
    // Mesma correção da gravação: a contagem vive no fechamento e o disparo fica
    // fora do atualizador de estado, que o React executa duas vezes em
    // desenvolvimento — o que fazia a foto ser tirada em duplicidade.
    if (contagemRef.current) return;

    let restante = CONTAGEM_REGRESSIVA_S;
    setContagemRegressiva(restante);

    contagemRef.current = setInterval(() => {
      restante -= 1;
      if (restante > 0) {
        setContagemRegressiva(restante);
        return;
      }
      if (contagemRef.current) {
        clearInterval(contagemRef.current);
        contagemRef.current = null;
      }
      setContagemRegressiva(null);
      tirarFotoReal();
    }, 1000);
  }, [tirarFotoReal]);

  const descartarMidia = useCallback(() => {
    if (midiaUrl) URL.revokeObjectURL(midiaUrl);
    setMidiaBlob(null);
    setMidiaUrl(null);
    setSegundos(0);
  }, [midiaUrl]);

  return {
    videoRef,
    streamPronto,
    erro,
    contagemRegressiva,
    gravando,
    segundos,
    midiaBlob,
    midiaUrl,
    iniciarGravacao,
    pararGravacao,
    tirarFoto,
    descartarMidia,
  };
}
