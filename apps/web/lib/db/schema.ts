import { integer, pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const depoimentos = pgTable("depoimentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  pais: text("pais").notNull(),
  estado: text("estado").notNull(),
  tipo: text("tipo", { enum: ["foto", "video"] }).notNull(),
  arquivoUrl: text("arquivo_url").notNull(),
  texto: text("texto"),
  autorizacaoImagem: boolean("autorizacao_imagem").notNull().default(false),
  prestigios: integer("prestigios").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export type Depoimento = typeof depoimentos.$inferSelect;
export type NovoDepoimento = typeof depoimentos.$inferInsert;

/**
 * Ranking do jogo da memória da Sala 6. Uma linha por partida vencida — quem perde
 * no tempo não pontua, então o ranking só tem partidas completas e é por isso que
 * comparar `segundos` entre elas é justo.
 *
 * `dificuldade` faz parte da chave de leitura, e não é um filtro opcional: o
 * protótipo mostra dois rankings lado a lado (p.11 do PDF) porque uma partida de
 * 9 pares e uma de 16 não são comparáveis num placar único.
 */
export const pontuacoesSala6 = pgTable("pontuacoes_sala6", {
  id: uuid("id").defaultRandom().primaryKey(),
  jogador: text("jogador").notNull(),
  dificuldade: text("dificuldade", { enum: ["facil", "dificil"] }).notNull(),
  /** Tempo gasto para fechar todos os pares. Menor é melhor. */
  segundos: integer("segundos").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export type PontuacaoSala6 = typeof pontuacoesSala6.$inferSelect;
export type NovaPontuacaoSala6 = typeof pontuacoesSala6.$inferInsert;
