import type { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket/eventos";

type IOInstance = Server<ClientToServerEvents, ServerToClientEvents>;

// server.ts (custom server) e as rotas de API (bundle separado do Next.js) rodam no mesmo
// processo Node, mas em registros de módulo distintos - uma variável de módulo comum não seria
// compartilhada entre eles. globalThis é o objeto global real do processo, então funciona aqui.
const globalParaIO = globalThis as unknown as { __socketIO?: IOInstance };

export function setIO(instance: IOInstance) {
  globalParaIO.__socketIO = instance;
}

export function getIO(): IOInstance | null {
  return globalParaIO.__socketIO ?? null;
}
