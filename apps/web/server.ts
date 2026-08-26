import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { reduzir, type Estado } from "@/lib/sala1/estado";
import { SALA1_ROOM, SALA7_ROOM, type ClientToServerEvents, type ServerToClientEvents } from "@/lib/socket/eventos";
import { setIO } from "@/lib/socket/server-instance";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

// Visitante parado no menu ou na pergunta "quer ver outro?" — foi embora sem encerrar.
const TIMEOUT_OCIOSO_MS = 60_000;

// Watchdog dos estados que estão tocando vídeo. A saída normal deles é a TV emitir
// "sala1:video-finalizado" no "ended"; isto aqui é a rede de segurança para quando
// esse evento não chega (TV desligada, autoplay bloqueado, arquivo com problema).
// Precisa ser mais longo que o vídeo mais comprido, senão corta a exibição no meio.
const WATCHDOG_TEMA_MS = 10 * 60_000;
const WATCHDOG_ENCERRANDO_MS = 60_000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
  });
  setIO(io);

  let estado: Estado = { tipo: "standby" };
  let timeoutOcioso: ReturnType<typeof setTimeout> | null = null;

  function prazoDoEstado(): number | null {
    switch (estado.tipo) {
      case "menu":
      case "fim-video":
        return TIMEOUT_OCIOSO_MS;
      case "tema":
        return WATCHDOG_TEMA_MS;
      case "encerrando":
        return WATCHDOG_ENCERRANDO_MS;
      case "standby":
        return null; // já é o estado de repouso, nada a resgatar
    }
  }

  function agendarTimeoutOcioso() {
    if (timeoutOcioso) clearTimeout(timeoutOcioso);
    const prazo = prazoDoEstado();
    if (prazo !== null) {
      timeoutOcioso = setTimeout(() => aplicarAcao({ tipo: "ocioso" }), prazo);
    }
  }

  function aplicarAcao(acao: Parameters<typeof reduzir>[1]) {
    estado = reduzir(estado, acao);
    io.to(SALA1_ROOM).emit("sala1:estado", estado);
    agendarTimeoutOcioso();
  }

  io.on("connection", (socket) => {
    socket.on("sala1:entrar", ({ papel }) => {
      socket.join(SALA1_ROOM);
      socket.data.papel = papel;
      socket.emit("sala1:estado", estado);
    });

    socket.on("sala1:iniciar", () => aplicarAcao({ tipo: "iniciar" }));
    socket.on("sala1:selecionar-tema", ({ temaId }) => aplicarAcao({ tipo: "selecionar-tema", temaId }));
    socket.on("sala1:sair", () => aplicarAcao({ tipo: "sair" }));
    socket.on("sala1:outro-sim", () => aplicarAcao({ tipo: "outro-sim" }));
    socket.on("sala1:outro-nao", () => aplicarAcao({ tipo: "outro-nao" }));
    socket.on("sala1:video-finalizado", () => aplicarAcao({ tipo: "video-finalizado" }));

    socket.on("sala7:entrar", () => {
      socket.join(SALA7_ROOM);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Servidor rodando em http://localhost:${port}`);
  });
});
