import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { reduzir, type Estado } from "@/lib/sala1/estado";
import { SALA1_ROOM, type ClientToServerEvents, type ServerToClientEvents } from "@/lib/socket/eventos";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

const TIMEOUT_OCIOSO_MS = 60_000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
  });

  let estado: Estado = { tipo: "standby" };
  let timeoutOcioso: ReturnType<typeof setTimeout> | null = null;

  function agendarTimeoutOcioso() {
    if (timeoutOcioso) clearTimeout(timeoutOcioso);
    if (estado.tipo === "menu" || estado.tipo === "fim-video") {
      timeoutOcioso = setTimeout(() => aplicarAcao({ tipo: "ocioso" }), TIMEOUT_OCIOSO_MS);
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
  });

  httpServer.listen(port, () => {
    console.log(`> Servidor rodando em http://localhost:${port}`);
  });
});
