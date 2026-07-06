# Museu do Sertão de Piranhas — Sistemas Interativos

Repositório do sistema web para os dispositivos interativos do Museu do Sertão de Piranhas, AL. Veja `PROJETO.md` para o contexto completo do projeto (escopo, arquitetura, cronograma).

Este guia é só pra rodar e testar o sistema localmente na sua máquina — hoje, o único sistema funcional é a **Sala 1**.

## Pré-requisitos

- [Node.js](https://nodejs.org) versão 22 ou superior
- npm (já vem com o Node)

Confirme as versões:

```bash
node -v
npm -v
```

## 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd museu-piranhas/apps/web
npm install
```

## 2. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Isso sobe o servidor (Next.js + WebSocket) em `http://localhost:3000`. Deixe rodando no terminal.

## 3. Acessar a Sala 1

A Sala 1 tem **duas telas separadas e sincronizadas**: o tablet (onde a pessoa interage) e a TV (onde os vídeos tocam). Abra as duas ao mesmo tempo, em abas/janelas diferentes:

- **Tablet:** http://localhost:3000/sala1/tablet
- **TV:** http://localhost:3000/sala1/tv

Clique no tablet pra ver a TV reagir em tempo real: tela inicial → escolher tema → vídeo tocando → pergunta de encerramento → volta ao início.

> **Se o vídeo na TV trocar mas não tocar:** o navegador está bloqueando autoplay com som (proteção padrão sem interação prévia do usuário). Vai aparecer um aviso "Toque para habilitar o som" — clique uma vez e o resto da sessão funciona normalmente. Isso não acontece no dispositivo real do museu (o Chromium do kiosk roda com uma flag que libera isso).

## 4. Testar em dois dispositivos diferentes (mais fiel ao uso real)

Se quiser testar o tablet no celular e a TV no computador (ou vice-versa), os dois precisam estar na **mesma rede Wi-Fi**.

1. Descubra o IP local da máquina que está rodando `npm run dev`:
   - Windows: `ipconfig` (procure o "Endereço IPv4" da rede Wi-Fi/Ethernet)
   - Mac/Linux: `ifconfig` ou `ip addr`
2. No outro dispositivo, acesse `http://<esse-ip>:3000/sala1/tablet` (ou `/sala1/tv`).

## 5. Modo de calibração dos botões (debug)

As telas do tablet são imagens com áreas clicáveis invisíveis por cima (não botões HTML comuns). Pra visualizar essas áreas (contorno vermelho + nome do botão), rode:

```bash
NEXT_PUBLIC_SALA1_DEBUG=1 npm run dev
```

No Windows (PowerShell):

```powershell
$env:NEXT_PUBLIC_SALA1_DEBUG="1"; npm run dev
```

Sem essa variável, os contornos ficam invisíveis (comportamento normal).

## Estrutura do projeto

```
apps/web/           → aplicação Next.js (frontend + servidor)
  app/sala1/tablet   → tela de interação do visitante
  app/sala1/tv       → tela de exibição de vídeo
  lib/sala1/         → máquina de estados, temas, hotspots
  public/images/     → imagens das telas do tablet
  public/videos/     → vídeos exibidos na TV
docker-compose.yml   → stack completa (app + banco + proxy) para deploy
PROJETO.md           → documento de escopo e arquitetura do projeto
```
