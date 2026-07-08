import { useCallback, useEffect, useRef, useState } from "react";

const DURACAO_MAXIMA_VIDEO_S = 60;
const CONTAGEM_REGRESSIVA_S = 5;

export function useCamera(tipo: "foto" | "video") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      .getUserMedia({ video: true, audio: tipo === "video" })
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
    };
  }, [tipo]);

  const limparIntervalo = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  const iniciarGravacaoReal = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const gravador = new MediaRecorder(stream, { mimeType: "video/webm" });
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
    intervaloRef.current = setInterval(() => {
      setSegundos((atual) => {
        if (atual + 1 >= DURACAO_MAXIMA_VIDEO_S) {
          pararGravacao();
          return atual + 1;
        }
        return atual + 1;
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciarGravacao = useCallback(() => {
    setContagemRegressiva(CONTAGEM_REGRESSIVA_S);
    const contagem = setInterval(() => {
      setContagemRegressiva((atual) => {
        if (atual === null) return null;
        if (atual <= 1) {
          clearInterval(contagem);
          iniciarGravacaoReal();
          return null;
        }
        return atual - 1;
      });
    }, 1000);
  }, [iniciarGravacaoReal]);

  const pararGravacao = useCallback(() => {
    limparIntervalo();
    setGravando(false);
    gravadorRef.current?.stop();
  }, []);

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
    setContagemRegressiva(CONTAGEM_REGRESSIVA_S);
    const contagem = setInterval(() => {
      setContagemRegressiva((atual) => {
        if (atual === null) return null;
        if (atual <= 1) {
          clearInterval(contagem);
          tirarFotoReal();
          return null;
        }
        return atual - 1;
      });
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
