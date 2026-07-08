"use client";

import { useEffect, useState } from "react";
import { TelaBoasVindas } from "@/components/escada/TelaBoasVindas";
import { TelaEscolha } from "@/components/escada/TelaEscolha";
import { TelaInformacoes } from "@/components/escada/TelaInformacoes";
import { TelaOrigem } from "@/components/escada/TelaOrigem";
import { TelaAutorizacao } from "@/components/escada/TelaAutorizacao";
import { TelaCaptura } from "@/components/escada/TelaCaptura";
import { TelaPreview } from "@/components/escada/TelaPreview";
import { TelaTexto } from "@/components/escada/TelaTexto";
import { TelaAgradecimento } from "@/components/escada/TelaAgradecimento";

type Passo =
  | "boas-vindas"
  | "escolha"
  | "informacoes"
  | "origem"
  | "autorizacao"
  | "captura"
  | "preview"
  | "texto"
  | "agradecimento";

const ESTADO_INICIAL = {
  tipo: null as "video" | "foto" | null,
  nome: "",
  email: "",
  pais: "",
  estado: "",
  autorizacaoImagem: false,
  midiaBlob: null as Blob | null,
  midiaUrl: null as string | null,
  texto: "",
};

export default function EscadaPage() {
  const [passo, setPasso] = useState<Passo>("boas-vindas");
  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  function reiniciar() {
    if (dados.midiaUrl) URL.revokeObjectURL(dados.midiaUrl);
    setDados(ESTADO_INICIAL);
    setPasso("boas-vindas");
  }

  useEffect(() => {
    if (passo !== "agradecimento") return;
    const timeout = setTimeout(reiniciar, 15000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  async function confirmarDepoimento() {
    if (!dados.tipo || !dados.midiaBlob) return;

    setEnviando(true);

    const formData = new FormData();
    formData.set("nome", dados.nome);
    formData.set("email", dados.email);
    formData.set("pais", dados.pais);
    formData.set("estado", dados.estado);
    formData.set("tipo", dados.tipo === "video" ? "video" : "foto");
    formData.set("texto", dados.texto);
    formData.set("autorizacaoImagem", String(dados.autorizacaoImagem));
    formData.set("arquivo", dados.midiaBlob, dados.tipo === "video" ? "depoimento.webm" : "depoimento.jpg");

    try {
      await fetch("/api/depoimentos", { method: "POST", body: formData });
    } finally {
      setEnviando(false);
      if (dados.midiaUrl) URL.revokeObjectURL(dados.midiaUrl);
      setDados(ESTADO_INICIAL);
      setPasso("agradecimento");
    }
  }

  switch (passo) {
    case "boas-vindas":
      return <TelaBoasVindas onDeixarDepoimento={() => setPasso("escolha")} />;

    case "escolha":
      return (
        <TelaEscolha
          onEscolher={(tipo) => {
            setDados((d) => ({ ...d, tipo }));
            setPasso("informacoes");
          }}
          onSair={reiniciar}
        />
      );

    case "informacoes":
      if (!dados.tipo) {
        setPasso("escolha");
        return null;
      }
      return (
        <TelaInformacoes
          tipo={dados.tipo}
          nome={dados.nome}
          email={dados.email}
          onNomeChange={(nome) => setDados((d) => ({ ...d, nome }))}
          onEmailChange={(email) => setDados((d) => ({ ...d, email }))}
          onAnterior={() => setPasso("escolha")}
          onProximo={() => setPasso("origem")}
        />
      );

    case "origem":
      return (
        <TelaOrigem
          nome={dados.nome}
          pais={dados.pais}
          estado={dados.estado}
          onPaisChange={(pais) => setDados((d) => ({ ...d, pais }))}
          onEstadoChange={(estado) => setDados((d) => ({ ...d, estado }))}
          onAnterior={() => setPasso("informacoes")}
          onProximo={() => setPasso("autorizacao")}
        />
      );

    case "autorizacao":
      return (
        <TelaAutorizacao
          nome={dados.nome}
          autorizado={dados.autorizacaoImagem}
          onAutorizadoChange={(autorizacaoImagem) => setDados((d) => ({ ...d, autorizacaoImagem }))}
          onAnterior={() => setPasso("origem")}
          onProximo={() => setPasso("captura")}
        />
      );

    case "captura":
      if (!dados.tipo) {
        setPasso("escolha");
        return null;
      }
      return (
        <TelaCaptura
          tipo={dados.tipo}
          onCapturado={(midiaBlob, midiaUrl) => {
            setDados((d) => ({ ...d, midiaBlob, midiaUrl }));
            setPasso("preview");
          }}
          onAnterior={() => setPasso("autorizacao")}
        />
      );

    case "preview":
      if (!dados.tipo || !dados.midiaUrl) {
        setPasso("captura");
        return null;
      }
      return (
        <TelaPreview
          tipo={dados.tipo}
          midiaUrl={dados.midiaUrl}
          onConfirmar={() => setPasso("texto")}
          onRegravar={() => {
            if (dados.midiaUrl) URL.revokeObjectURL(dados.midiaUrl);
            setDados((d) => ({ ...d, midiaBlob: null, midiaUrl: null }));
            setPasso("captura");
          }}
          onCancelar={reiniciar}
        />
      );

    case "texto":
      if (!dados.tipo) {
        setPasso("escolha");
        return null;
      }
      return (
        <TelaTexto
          tipo={dados.tipo}
          texto={dados.texto}
          onTextoChange={(texto) => setDados((d) => ({ ...d, texto }))}
          onProximo={confirmarDepoimento}
          enviando={enviando}
        />
      );

    case "agradecimento":
      return <TelaAgradecimento />;
  }
}
