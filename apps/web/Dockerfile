# Dependências completas (com devDependencies) — usadas só para compilar.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Só as dependências de produção — é este node_modules que vai para a imagem
# final. Atenção: `tsx` é dependência de PRODUÇÃO neste projeto, não de
# desenvolvimento, porque `npm run start` executa `server.ts` e as migrations
# direto em TypeScript. Se ele voltar para devDependencies, a imagem sobe e
# quebra no boot.
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# O npm instala as duas variantes do binário SWC do Next (glibc e musl), 124 MB
# cada, por não conseguir decidir a libc sozinho. Esta imagem é Alpine, que usa
# musl — a variante gnu nunca é carregada. Se um dia a base deixar de ser
# Alpine, esta linha precisa sair, senão o Next perde o binário que usa.
RUN npm ci --omit=dev && rm -rf node_modules/@next/swc-linux-x64-gnu

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# O cache do Next serve só para acelerar recompilações; em produção é peso morto.
RUN npm run build && rm -rf .next/cache

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
