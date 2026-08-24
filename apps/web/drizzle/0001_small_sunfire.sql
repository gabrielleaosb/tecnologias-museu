CREATE TABLE "pontuacoes_sala6" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jogador" text NOT NULL,
	"dificuldade" text NOT NULL,
	"segundos" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
