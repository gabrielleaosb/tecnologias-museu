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
