CREATE TABLE "depoimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"pais" text NOT NULL,
	"estado" text NOT NULL,
	"tipo" text NOT NULL,
	"arquivo_url" text NOT NULL,
	"texto" text,
	"autorizacao_imagem" boolean DEFAULT false NOT NULL,
	"prestigios" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
