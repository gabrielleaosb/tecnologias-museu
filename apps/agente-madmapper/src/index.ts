import { createSocket } from "node:dgram";
import { io, type Socket } from "socket.io-client";
import { carregarConfig, type Cue } from "./config.ts";
import { descreverMensagem, montarMensagemOsc } from "./osc.ts";

/**
 * Espelho do tipo `Estado` de apps/web/lib/sala1/estado.ts.
 *
 * Duplicado de propósito: o agente é um pacote independente, instalado sozinho no PC
 * do museu, e não deve arrastar o app Next inteiro como dependência. Se a máquina de
 * estados da Sala 1 mudar lá, esta lista precisa ser atualizada aqui também.
 */
type Estado =
  | { tipo: "standby" }
  | { tipo: "menu"; variante?: "apos-sim" }
  | { tipo: "tema"; temaId: string }
  | { tipo: "fim-video"; temaId: string }
  | { tipo: "encerrando" };

const MODO_TESTE = process.argv.includes("--teste");

function agora(): string {
  return new Date().toLocaleTimeString("pt-BR");
}

function log(mensagem: string): void {
  console.log(`[${agora()}] ${mensagem}`);
}

/**
 * Converte o estado da sala na chave usada no config.json.
 * Os temas viram "tema:<id>" para que cada um possa apontar para um cue diferente.
 */
function chaveDoEstado(estado: Estado): string {
  return estado.tipo === "tema" ? `tema:${estado.temaId}` : estado.tipo;
}

function main(): void {
  const config = carregarConfig();
  const udp = createSocket("udp4");

  log(`Agente MadMapper iniciando${MODO_TESTE ? " em MODO DE TESTE (nada será enviado)" : ""}.`);
  log(`Servidor: ${config.servidorUrl}`);
  log(`MadMapper: ${config.madmapper.host}:${config.madmapper.porta} (OSC/UDP)`);

  function enviarCue(cue: Cue): void {
    const descricao = descreverMensagem(cue.endereco, cue.args);

    if (MODO_TESTE) {
      log(`  [teste] enviaria OSC → ${descricao}`);
      return;
    }

    const pacote = montarMensagemOsc(cue.endereco, cue.args);
    udp.send(pacote, config.madmapper.porta, config.madmapper.host, (erro) => {
      if (erro) log(`  ✗ falha ao enviar OSC (${descricao}): ${erro.message}`);
      else log(`  ✓ OSC enviado → ${descricao}`);
    });
  }

  // Guarda a última chave disparada: o servidor reemite o estado a cada reconexão
  // e a cada novo cliente que entra na sala, e não queremos redisparar o mesmo cue.
  let ultimaChave: string | null = null;
  const chavesDesconhecidas = new Set<string>();

  const socket: Socket = io(config.servidorUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelayMax: 10_000,
  });

  socket.on("connect", () => {
    log("Conectado ao servidor.");
    // Reenvia o cue na próxima atualização de estado, mesmo que seja o mesmo de antes:
    // se o MadMapper reiniciou enquanto estávamos offline, ele perdeu o cue atual.
    ultimaChave = null;
    socket.emit("sala1:entrar", { papel: "madmapper" });
  });

  socket.on("disconnect", (motivo: string) => {
    log(`Desconectado do servidor (${motivo}). Tentando reconectar...`);
  });

  socket.on("connect_error", (erro: Error) => {
    log(`Falha ao conectar: ${erro.message}`);
  });

  socket.on("sala1:estado", (estado: Estado) => {
    const chave = chaveDoEstado(estado);
    if (chave === ultimaChave) return;
    ultimaChave = chave;

    log(`Estado da sala: ${chave}`);

    if (!(chave in config.cues)) {
      // Avisa uma vez por chave para não poluir o log em loop.
      if (!chavesDesconhecidas.has(chave)) {
        chavesDesconhecidas.add(chave);
        log(`  ⚠ nenhum cue configurado para "${chave}" — adicione em config.json se precisar.`);
      }
      return;
    }

    const cue = config.cues[chave];
    if (!cue) {
      log(`  — cue definido como null, nada a disparar.`);
      return;
    }

    enviarCue(cue);
  });

  function encerrar(sinal: string): void {
    log(`Recebido ${sinal}, encerrando.`);
    socket.close();
    udp.close();
    process.exit(0);
  }

  process.on("SIGINT", () => encerrar("SIGINT"));
  process.on("SIGTERM", () => encerrar("SIGTERM"));
}

try {
  main();
} catch (erro) {
  console.error(`\n✗ ${(erro as Error).message}\n`);
  process.exit(1);
}
