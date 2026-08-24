"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { coresSala6 } from "@/lib/sala6/cores";
import { UNIDADE_SALA6 } from "@/lib/sala6/medidas";
import { DIFICULDADES, type Dificuldade } from "@/lib/sala6/dificuldades";
import {
  desvirar,
  MS_MOSTRANDO_ERRO,
  novoJogo,
  venceu,
  virar,
  type EstadoJogo,
} from "@/lib/sala6/jogo";
import type { Ranking } from "@/app/api/sala6/ranking/route";
import { TelaMenu } from "@/components/sala6/TelaMenu";
import { TelaNovoJogo } from "@/components/sala6/TelaNovoJogo";
import { Tabuleiro } from "@/components/sala6/Tabuleiro";
import { BotaoDialogo, TelaDialogo } from "@/components/sala6/TelaDialogo";
import { TelaRanking } from "@/components/sala6/TelaRanking";

type Etapa = "menu" | "novo-jogo" | "jogando" | "recomecar" | "ranking";

interface Partida {
  jogo: EstadoJogo;
  /** Segundos que faltam no relógio. Chegou a zero, o visitante perdeu. */
  restante: number;
}

export default function Sala6Page() {
  const router = useRouter();

  const [etapa, setEtapa] = useState<Etapa>("menu");
  const [nome, setNome] = useState("");
  const [dificuldade, setDificuldade] = useState<Dificuldade>("facil");
  const [partida, setPartida] = useState<Partida | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [destaque, setDestaque] = useState<string>();

  /**
   * O desfecho não é estado guardado: sai do próprio tabuleiro. Guardá-lo abriria
   * a possibilidade de ele discordar das cartas — uma tela de vitória sobre um
   * tabuleiro incompleto — que aqui simplesmente não existe.
   */
  const ganhou = partida !== null && venceu(partida.jogo);
  const perdeu = partida !== null && !ganhou && partida.restante <= 0;
  const emJogo = etapa === "jogando" && partida !== null && !ganhou && !perdeu;

  // Relógio da partida. Depende de `emJogo`, um booleano, e não de `partida`: se
  // dependesse do objeto, cada tique recriaria o intervalo e o relógio andaria fora
  // de compasso.
  useEffect(() => {
    if (!emJogo) return;

    const id = setInterval(() => {
      setPartida((p) => (p ? { ...p, restante: Math.max(0, p.restante - 1) } : p));
    }, 1000);

    return () => clearInterval(id);
  }, [emJogo]);

  // Devolve o par errado para baixo depois do intervalo em que o visitante o vê.
  const mostrandoErro = partida?.jogo.viradas.length === 2;
  useEffect(() => {
    if (!mostrandoErro) return;

    const id = setTimeout(() => {
      setPartida((p) => (p ? { ...p, jogo: desvirar(p.jogo) } : p));
    }, MS_MOSTRANDO_ERRO);

    return () => clearTimeout(id);
  }, [mostrandoErro]);

  // Grava a vitória. `ganhou` passa de falso para verdadeiro uma única vez por
  // partida, então o efeito dispara uma vez — as demais dependências são lidas do
  // fechamento desse instante, que é justamente o estado da partida vencida.
  useEffect(() => {
    if (!ganhou || !partida) return;

    const gastos = DIFICULDADES[partida.jogo.dificuldade].segundos - partida.restante;
    let ativo = true;

    void (async () => {
      try {
        const r = await fetch("/api/sala6/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jogador: nome.trim(),
            dificuldade: partida.jogo.dificuldade,
            segundos: gastos,
          }),
        });
        // Falha ao gravar não tira a vitória do visitante: ele já está na tela de
        // vitória e apenas não entra no ranking.
        if (r.ok && ativo) setDestaque(((await r.json()) as { id: string }).id);
      } catch {
        /* totem sem rede — segue sem pontuar */
      }
    })();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganhou]);

  const carregarRanking = useCallback(async () => {
    const r = await fetch("/api/sala6/ranking", { cache: "no-store" });
    if (r.ok) setRanking((await r.json()) as Ranking);
  }, []);

  function iniciar() {
    setPartida({ jogo: novoJogo(dificuldade), restante: DIFICULDADES[dificuldade].segundos });
    setDestaque(undefined);
    setEtapa("jogando");
  }

  /**
   * O toque só descreve a intenção; quem decide é o atualizador, que recebe sempre
   * o tabuleiro mais recente. Ler `partida` aqui seria um erro: dois toques no mesmo
   * tique do JavaScript — o que um toque duplo rápido produz — caem no mesmo lote do
   * React e leriam ambos o estado anterior, de modo que a segunda carta apagaria a
   * primeira em vez de formar par com ela.
   */
  function aoVirar(indice: number) {
    setPartida((p) => (p ? { ...p, jogo: virar(p.jogo, indice).estado } : p));
  }

  /**
   * Toda saída para o menu encerra a sessão do visitante — inclusive o nome.
   *
   * Sem isso o totem guarda o nome de quem jogou por último e o próximo visitante
   * encontra o campo já preenchido, o que além de confuso faz a pontuação dele
   * entrar no ranking com o nome de outra pessoa.
   */
  function irParaMenu() {
    setPartida(null);
    setNome("");
    setEtapa("menu");
  }

  function abrirRanking() {
    setEtapa("ranking");
    void carregarRanking();
  }

  return (
    <main
      className="h-screen w-screen overflow-hidden"
      style={
        {
          "--u": UNIDADE_SALA6,
          backgroundColor: coresSala6.marromEscuro,
          // A sala roda em monitor touch. Sem isto o navegador segura cada toque
          // esperando para ver se vira um duplo-toque de zoom, e o jogo inteiro
          // responde com atraso — o que num jogo contra o relógio é injusto.
          touchAction: "manipulation",
        } as React.CSSProperties
      }
    >
      {/* O canvas 16:9 fica centralizado quando a tela do totem não é exatamente 16:9. */}
      <div
        className="mx-auto"
        style={{
          width: "calc(var(--u) * 100)",
          height: "calc(var(--u) * 56.25)",
          marginTop: "50vh",
          transform: "translateY(-50%)",
        }}
      >
        {etapa === "menu" && (
          <TelaMenu
            onNovoJogo={() => setEtapa("novo-jogo")}
            onRanking={abrirRanking}
            onVoltar={() => router.push("/")}
          />
        )}

        {etapa === "novo-jogo" && (
          <TelaNovoJogo
            nome={nome}
            onNomeChange={setNome}
            dificuldade={dificuldade}
            onDificuldadeChange={setDificuldade}
            onIniciar={iniciar}
            onSair={irParaMenu}
          />
        )}

        {emJogo && partida && (
          <Tabuleiro
            estado={partida.jogo}
            segundosRestantes={partida.restante}
            onVirar={aoVirar}
            onSair={() => setEtapa("recomecar")}
          />
        )}

        {etapa === "jogando" && ganhou && (
          <TelaDialogo
            fundo={coresSala6.ocre}
            logo="marrom"
            titulo="VOCÊ VENCEU!"
            subtitulo="VEJA SUA COLOCAÇÃO"
            casa={{ variante: "sairMarrom", x: 927, y: 722, rotulo: "Sair", onClick: irParaMenu }}
          >
            <BotaoDialogo y={469} fundo={coresSala6.begeMedio} onClick={abrirRanking}>
              RANKING GERAL
            </BotaoDialogo>
          </TelaDialogo>
        )}

        {etapa === "jogando" && perdeu && (
          <TelaDialogo
            fundo={coresSala6.marromEscuro}
            logo="bege"
            titulo="VOCÊ PERDEU"
            subtitulo="TENTE NOVAMENTE"
            casa={{ variante: "menuMarrom", x: 922, y: 734, rotulo: "Menu", onClick: irParaMenu }}
          >
            <BotaoDialogo y={469} fundo={coresSala6.ocre} onClick={() => setEtapa("novo-jogo")}>
              NOVO JOGO
            </BotaoDialogo>
          </TelaDialogo>
        )}

        {etapa === "recomecar" && (
          <TelaDialogo fundo={coresSala6.marrom} logo="bege" titulo="RECOMEÇAR?">
            <BotaoDialogo y={469} fundo={coresSala6.ocre} onClick={() => setEtapa("novo-jogo")}>
              NOVO JOGO
            </BotaoDialogo>
            <BotaoDialogo y={659} fundo={coresSala6.begeMedio} onClick={irParaMenu}>
              SAIR
            </BotaoDialogo>
          </TelaDialogo>
        )}

        {etapa === "ranking" && (
          <TelaRanking ranking={ranking} destaque={destaque} onSair={irParaMenu} />
        )}
      </div>
    </main>
  );
}
