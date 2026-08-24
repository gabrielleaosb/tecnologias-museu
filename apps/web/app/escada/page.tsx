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
import { TecladoVirtual } from "@/components/TecladoVirtual";
import { cores } from "@/lib/escada/cores";
import { PAIS_PADRAO } from "@/lib/escada/paises";

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

const TIMEOUT_INATIVIDADE_MS = 90_000;

const ESTADO_INICIAL = {
  tipo: null as "video" | "foto" | null,
  nome: "",
  email: "",
  // Brasil já vem escolhido; o visitante só mexe no país se vier de fora.
  pais: PAIS_PADRAO,
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
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  /** Quanto a tela precisa subir para o campo em foco escapar do teclado. */
  const [deslocamentoTeclado, setDeslocamentoTeclado] = useState(0);

  function reiniciar() {
    if (dados.midiaUrl) URL.revokeObjectURL(dados.midiaUrl);
    setDados(ESTADO_INICIAL);
    setErroEnvio(null);
    setPasso("boas-vindas");
  }

  useEffect(() => {
    if (passo !== "agradecimento") return;
    const timeout = setTimeout(reiniciar, 15000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  useEffect(() => {
    if (passo === "boas-vindas" || passo === "agradecimento") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    function resetarTimeout() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(reiniciar, TIMEOUT_INATIVIDADE_MS);
    }

    resetarTimeout();
    window.addEventListener("pointerdown", resetarTimeout);
    window.addEventListener("keydown", resetarTimeout);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", resetarTimeout);
      window.removeEventListener("keydown", resetarTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);

  async function confirmarDepoimento() {
    if (!dados.tipo || !dados.midiaBlob) return;

    setEnviando(true);
    setErroEnvio(null);

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
      const resposta = await fetch("/api/depoimentos", { method: "POST", body: formData });

      if (!resposta.ok) {
        // Antes, qualquer falha caía no `finally` e o visitante via a tela de
        // agradecimento mesmo com o depoimento perdido.
        setErroEnvio(
          resposta.status === 413
            ? "O vídeo ficou grande demais para ser enviado. Grave um mais curto e tente de novo."
            : "Não foi possível enviar seu depoimento. Toque em PRÓXIMO para tentar de novo."
        );
        return;
      }

      if (dados.midiaUrl) URL.revokeObjectURL(dados.midiaUrl);
      setDados(ESTADO_INICIAL);
      setPasso("agradecimento");
    } catch {
      setErroEnvio("Não foi possível enviar seu depoimento. Toque em PRÓXIMO para tentar de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {/*
        A tela sobe só enquanto o teclado está aberto e só o tanto que o campo em
        foco precisa — no depoimento sobram 17vh abaixo do campo, e o teclado não
        cabe ali. Em repouso o deslocamento é zero e o desenho é exatamente o que
        foi validado contra o protótipo.
      */}
      {/*
        Fundo do vão: ao subir, a tela deixa atrás de si uma faixa da altura do
        deslocamento. Esta camada não se desloca — se a cor estivesse na div que se
        move, ela subiria junto e o vão continuaria branco. Fixar a cor é seguro: o
        teclado só abre nas telas com campo de texto — informações e depoimento — e
        as duas usam o fundo claro de `ESCADA.tela`.
      */}
      <div
        // `overflow-hidden`: as telas medem 100vw, que inclui a barra de rolagem, e
        // qualquer sobra vira uma barra horizontal no rodapé do totem.
        className="h-screen overflow-hidden"
        style={{ backgroundColor: cores.fundoClaro }}
      >
        <div
          style={{
            transform: `translateY(-${deslocamentoTeclado}px)`,
            transition: "transform 180ms ease-out",
          }}
        >
          {renderizarPasso()}
        </div>
      </div>

      {/* Fora da div que se desloca: o teclado fica preso ao rodapé da tela. */}
      <TecladoVirtual onDeslocar={setDeslocamentoTeclado} />
    </>
  );

  function renderizarPasso() {
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
            tipo={dados.tipo ?? "foto"}
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
            tipo={dados.tipo ?? "foto"}
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
            // Volta para a revisão da mídia, que segue guardada em `dados`. O texto
            // já escrito também se mantém, então voltar não custa nada a quem só
            // quer conferir a foto de novo.
            onAnterior={() => setPasso("preview")}
            onProximo={confirmarDepoimento}
            enviando={enviando}
            erro={erroEnvio}
          />
        );

      case "agradecimento":
        return <TelaAgradecimento />;
    }
  }
}
