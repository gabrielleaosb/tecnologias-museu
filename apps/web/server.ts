import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { temas } from "@/lib/temas";
import { SALA1_ROOM, type ClientToServerEvents, type ServerToClientEvents } from "@/lib/socket/events";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("sala1:entrar", ({ papel }) => {
      socket.join(SALA1_ROOM);
      socket.data.papel = papel;
    });

    socket.on("sala1:selecionar-tema", ({ temaId }) => {
      const tema = temas.find((t) => t.id === temaId);
      if (!tema) return;
      io.to(SALA1_ROOM).emit("sala1:tocar-video", { temaId: tema.id, video: tema.video });
    });

    socket.on("sala1:video-finalizado", () => {
      io.to(SALA1_ROOM).emit("sala1:voltar-loop");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Servidor rodando em http://localhost:${port}`);
  });
});
