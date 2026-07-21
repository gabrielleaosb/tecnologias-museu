# Museu do Sertão de Piranhas — Documento de Projeto

## Visão Geral

Sistema interativo para o Museu do Sertão de Piranhas, Alagoas. Composto por 3 sistemas independentes (com exceção de uma dependência entre Escada e Sala 7) entregues como um único app web rodando localmente nos dispositivos do museu.

**Desenvolvedor:** Gabriel (solo) + Claude  
**Data de inauguração:** Setembro de 2026 (provável segunda quinzena, data não confirmada)  
**Contrato:** Projeto já vendido pela empresa. Gabriel define seu próprio honorário.  
**Honorário estimado:** R$ 3.000 – R$ 5.000 (desenvolvimento)  
**Despesas de deslocamento:** reembolsáveis por fora do honorário  

---

## Os 3 Sistemas

### 1. Sala 1 — Kiosk Interativo com Maquete

**O que faz:**  
Tablet exibe tela em loop de boas-vindas ("Maria", assistente virtual do museu, guia a experiência por vídeo). Visitante seleciona um tema. Um vídeo sobre o tema é reproduzido na TV **e, em paralelo, o MadMapper dispara um vídeo projetado sobre a maquete**. Ao terminar (ou se o visitante pular), a TV pergunta se ele quer ver outro tema. Roteiro completo em `apps/web/roteiro-sala1.txt`.

**Temas (5, não 4 — "O Museu" foi adicionado):**
- O Cangaço
- A Cidade
- O Rio São Francisco
- A Ferrovia
- O Museu

**Dispositivos:** 3 saídas físicas sincronizadas — um **tablet** (imagens estáticas com hotspots clicáveis sobre os botões), uma **TV** (onde os vídeos tocam: standby, intro da Maria, vídeo do tema, pergunta de encerramento) e um **projetor** com **projeção mapeada sobre a maquete** via **MadMapper**.

A projeção sobre a maquete é disparada pelo **agente MadMapper** (`apps/agente-madmapper/`) — ver seção "Integração MadMapper" abaixo.

**Máquina de estados (implementada em `lib/sala1/estado.ts`):**
```
standby → (iniciar) → menu → (seleciona tema) → tema
tema → (clica "sair"/"encerrar" OU vídeo termina) → fim-video
fim-video → (SIM) → menu (variante "após escolher sim", outro vídeo de transição da Maria)
fim-video → (NÃO) → encerrando → (vídeo termina) → standby
menu / fim-video → (1 min sem interação) → standby
```

**Assets:** imagens do tablet em `public/images/sala1/`, vídeos da TV em `public/videos/sala1/` (nomes normalizados, sem acento/espaço — os originais enviados tinham nomes como "7.2 - Tablet-(7.2)-NÃO.jpg").

Sincronização tablet ↔ TV em tempo real via WebSocket (Socket.IO), com o servidor mantendo o estado autoritativo (o tablet nunca decide sozinho o que a TV mostra).

**✅ Status atual (2026-07-06): funcional em teste local.** Fluxo completo testado manualmente (tablet + TV em dois navegadores/dispositivos na mesma rede) — hotspots calibrados e confirmados pelo Gabriel, troca de vídeo na TV funcionando (com fallback de "toque para habilitar o som" quando o navegador bloqueia autoplay com áudio — não deve ocorrer no kiosk real, que roda com a flag `--autoplay-policy=no-user-gesture-required`).

**Ainda não testado/pendente:** build e execução via Docker Compose (imagem só foi validada com `npm run build`, não com `docker build`), deploy na VPS, teste no tablet/TV físicos do museu (touch real, resolução real do dispositivo), modo kiosk do Chromium.

---

### 2. Escada — Cabine Lambe-Lambe

**O que faz:**  
Cabine cenográfica embaixo da escada. Tablet + webcam. Visitante registra um depoimento (foto ou vídeo). As mídias são exibidas em tempo real na Sala 7.

**Fluxo completo:**
1. Tela de boas-vindas + explicação
2. Escolha: Foto ou Vídeo
3. Autorização de uso de imagem (LGPD)
4. Captura (5 segundos de contagem regressiva)
5. Preview — Confirmar / Tirar outra / Cancelar
6. Cancelar exibe confirmação de exclusão
7. Confirmar salva no banco e exibe agradecimento
8. Depoimento aparece imediatamente na Sala 7

**Dependência crítica:** este sistema precisa se comunicar com a Sala 7 (ver seção de arquitetura).

**✅ Status de fidelidade visual (2026-07-13):** passada de fidelidade visual feita a partir dos 3 PDFs do protótipo (Adobe XD exportado). Corrigido um bug estrutural que afetava todo o app: a fonte da marca ("Futura PT", já configurada via `@font-face`) nunca era aplicada — o `body` tinha `font-family: Arial` fixo sobrescrevendo tudo. Cores de todas as telas (Escada, Admin, Sala 7) recalibradas a partir de amostragem de pixel nos PDFs renderizados em alta resolução. Corrigida a tela de Escolha (vídeo/foto) que usava fundo claro por engano — no protótipo ela usa o mesmo fundo escuro da tela de boas-vindas. Adicionado o logo (que estava faltando) em 6 das telas do fluxo. Sala 7: nome do visitante agora sobreposto na foto/vídeo (como no protótipo), painel de filtro virou card flutuante. Escada e Sala 7 validados visualmente (navegador vs. PDF) e ficaram muito próximos do protótipo.

**⚠️ Pendente:** Admin (`/admin` e `/admin/login`) ainda não está 100% fiel — a tela de login não tem design de referência no PDF (só a lista de depoimentos foi prototipada) e está com um visual genérico/placeholder; a lista de depoimentos por dentro também precisa de mais uma passada de ajuste fino. Precisa de revisão específica do que está diferente antes da próxima rodada.

**✅ Adequações pra hardware físico (2026-07-16):** com a definição do hardware real da cabine (webcam USB + monitor touch + mini PC), foram resolvidas 4 lacunas que impediriam o funcionamento em produção:
1. **HTTPS** — `getUserMedia` (captura de câmera) exige contexto seguro; Caddy agora emite certificado automático via domínio (`DOMAIN` no `.env` da raiz), com `Caddyfile.local` como alternativa self-signed pra testes em rede local sem domínio público. Ver seção "Notas Técnicas" abaixo.
2. **Teclado virtual em tela** (`components/escada/TecladoVirtual.tsx`) — como o dispositivo é só um monitor touch (sem teclado físico), os campos de nome/e-mail/país/estado/depoimento agora abrem um teclado on-screen embutido no app (funciona independente do SO do mini PC — não depende do teclado virtual nativo do Windows/Linux). `inputMode="none"` nos campos evita que o teclado do SO abra em duplicidade.
3. **Timeout de inatividade geral** — antes só a tela de agradecimento resetava sozinha (15s). Agora qualquer tela do fluxo (exceto boas-vindas) reseta pra tela inicial após 90s sem toque/tecla, cobrindo o caso de alguém abandonar o preenchimento no meio.
4. **Guia de operação física** — `OPERACAO-CABINE.md` na raiz do repo documenta o setup do Chromium kiosk (perfil persistente pra permissão de câmera sobreviver a reboots, flags, autostart, checklist de validação em campo).

**✅ Passada de fidelidade pixel-a-pixel: telas de Informações, Origem e Texto (2026-07-16), a partir do CSS exportado do XD:**
- Fontes e espaçamentos ajustados com valores exatos do XD (ex: título/label a 40px com letter-spacing 4px, placeholders em Futura Medium 37px cor `#3D2A1A` com letter-spacing 3.7px via `placeholder:` do Tailwind).
- Inputs de texto (Nome, E-mail, País, Estado) com dimensões exatas do XD: `width: 827px` (com `max-width: 100%` pra não estourar em telas menores), `height: 58px`, `background: #E2B291`, `border-radius: 4px`.
- Frases não quebram mais no meio (`whitespace-nowrap`) — cada uma ocupa uma linha e ficam empilhadas via `<br/>`, replicando o texto corrido do protótipo.
- Logo trocada para `logo-escura1-vertical.png` (variante `escura1-vertical` em `components/escada/Logo.tsx`), reposicionada (+20px pra baixo, +15px pra direita) e aumentada (~30% + mais 15% = ~50% do tamanho original).
- Ícone de vídeo/foto (tela de Informações): corrigido de `play.png` (errado) pra `video.png`, aumentado 50%.
- Botões ANTERIOR/PRÓXIMO passaram a ficar centralizados verticalmente na tela (bordas esquerda/direita, meio da altura), via prop `centralizado` em `components/escada/Navegacao.tsx`, replicando o protótipo — não mudou a tela de Autorização, que segue com os botões no rodapé.
- Teclado virtual: mudou de "empurrar a tela pra cima" para simplesmente sobrepor a tela (comportamento pedido por Gabriel); telas de input receberam `padding-top` extra pra que os campos fiquem acima da área ocupada pelo teclado quando aberto.

**✅ Migração para unidades responsivas (2026-07-18):** todos os componentes da Escada convertidos de pixels fixos para `vw`/`vh` baseados no canvas 1920×1080 do XD. A proporção dos elementos se mantém em qualquer resolução de dispositivo sem overflow ou scroll. Arquivos afetados: `Logo.tsx`, `TopoTela.tsx`, `BotaoCirculo.tsx`, `Navegacao.tsx`, `ItemAcao.tsx`, `TelaBoasVindas.tsx`, `TelaEscolha.tsx`, `TelaAutorizacao.tsx`, `TelaCaptura.tsx`, `TelaInformacoes.tsx`, `TelaOrigem.tsx`, `TelaTexto.tsx`, `TelaPreview.tsx`, `TelaAgradecimento.tsx`.

**✅ Fidelidade pixel-a-pixel: TelaBoasVindas e TelaEscolha (2026-07-18):**
- `TelaBoasVindas`: título quebrado em 2 linhas com pesos distintos (Bold / ExtraBold / Medium), caixa com dimensões exatas do XD (`66.1vw × 22.3vh`, cor `#465760`), botão com `45.1vw × 12.69vh`, `border-radius: 3.59vw`, cor `#FFB50B`, texto `#491F0A` com letter-spacing 6.38px; logo horizontal aumentada para `16.67vw`.
- `TelaEscolha`: logo `cinza-vertical` (`11.53vw`) com posição ajustada; botão SAIR espelhado horizontalmente em relação à logo; título "ESCOLHA UMA DAS OPÇÕES" posicionado absolutamente na altura do SAIR (Bold 40px, `2.08vw`); círculos dos botões `18.7vw` com ícones vídeo/foto em dimensões proporcionais ao XD; caixa escura `59.58vw × 15.56vh`, texto Futura PT Book 40px letter-spacing 4px. `TopoTela` e `Logo` agora aceitam props `logoStyle` e `sairStyle` para ajustes por tela sem afetar as demais.
- `TelaInformacoes`: logo `escura1-vertical` alinhada ao mesmo tamanho e posição da TelaEscolha (`11.53vw`, `left: 5.5vw`, `top: calc(2.5vw + 2vh)`).

**⚠️ Próxima alteração planejada:** continuar a passada de fidelidade pixel-a-pixel nas telas restantes do fluxo da Escada — `TelaAutorizacao`, `TelaCaptura`, `TelaPreview`, `TelaOrigem`, `TelaTexto` e `TelaAgradecimento` — aplicando CSS exportado do XD da mesma forma feita em TelaBoasVindas e TelaEscolha.

---

### 3. Sala 8 — Assistente Virtual Interativo (Cangaço)

**O que faz:**  
Totem com chatbot guiado por menus sobre o tema Cangaço. Não é IA generativa — é um fluxo determinístico com respostas SIM/NÃO e seleção por número.

**Temas disponíveis:**
- Lampião
- Maria Bonita
- Moda do Couro
- A Morte do Lampião
- O Início do Cangaço

**Fluxo:**  
`Boas-vindas → SIM/NÃO continuar → Seleção de tema por número → Conteúdo → Loop`

**Tratamento de erro:** resposta inválida exibe mensagem de "não entendi" e repete as opções.

---

## Arquitetura Técnica

### Stack (atualizada — ver decisão de hospedagem abaixo)

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 16 (App Router) |
| Tempo real (sync entre telas) | Socket.IO (custom server Node) |
| Banco de dados | PostgreSQL (container Docker) + Drizzle ORM |
| Armazenamento de mídia | Volume Docker (`/public/videos`, uploads da Escada) |
| Empacotamento/deploy | Docker + Docker Compose (`web`, `db`, `caddy`) |
| Reverse proxy / TLS | Caddy |
| Browser nos dispositivos | Chromium em modo kiosk (`--kiosk --noerrors`) |

### Rotas do app

```
/sala1/tablet → Tela de seleção de tema (interação do visitante)
/sala1/tv     → Tela de exibição (loop + vídeo do tema), sincronizada via WebSocket
/escada       → Cabine lambe-lambe (foto/vídeo)
/sala7        → Galeria de depoimentos em loop (TV)
/sala8        → Assistente virtual do Cangaço (ainda não implementada)
```

### Pacotes do repositório

```
apps/web/              → App Next.js + Socket.IO (todas as salas)
apps/agente-madmapper/ → Agente local do museu: escuta a Sala 1 e dispara cues OSC
```

### Infraestrutura (DECISÃO ATUALIZADA)

- **Hospedagem em VPS**, não mais 100% local — confirmado que o museu terá internet estável
- App rodando via **Docker Compose** na VPS; a mesma imagem pode subir localmente se necessário (portabilidade mantida)
- **AnyDesk** mantido nos PCs físicos para manutenção/suporte
- Cada dispositivo (tablet, TV, totem) é um cliente (browser em modo kiosk) que se conecta à VPS
- Sincronização entre telas da mesma sala (Sala 1: tablet↔TV; Escada→Sala7) passa a ser feita **pelo servidor central na VPS** via WebSocket, não mais por rede local do museu
- MadMapper é integração **da Sala 1** e roda **localmente no museu**, controlado por OSC/UDP através do agente em `apps/agente-madmapper/` — ver seção dedicada abaixo

### Integração MadMapper (Sala 1)

Ao selecionar um tema no tablet, o vídeo toca na TV **e** o MadMapper dispara, em paralelo, um vídeo projetado sobre a maquete.

**Implementado em `apps/agente-madmapper/`** — pacote independente, com README próprio. Documentação completa de instalação e configuração está lá; o essencial:

**Como o MadMapper é controlado:** por **OSC (Open Sound Control) sobre UDP** — não HTTP. Endereços no formato `/presets/<nome do cue>` (se o nome do cue tem espaço, o endereço tem espaço: `/presets/Cue 1`). Também existem `/presets/next` e `/presets/previous`. A porta de entrada OSC é configurável nas preferências do MadMapper, e ele suporta **OSC Query** para listar os endereços disponíveis — usar isso para descobrir os nomes exatos em vez de adivinhar.

**Conceito de Cue:** o MadMapper tem uma grade de *Scenes* (restauram o estado completo do documento — surfaces, fixtures, mídias) e *Cues* (guardam um conjunto escolhido de parâmetros). Plano: mapear a maquete uma vez e salvar **um cue por tema** (Cangaço, A Cidade, Rio São Francisco, A Ferrovia, O Museu), cada um definindo qual vídeo toca em qual parte da maquete.

**Por que um agente local:** o MadMapper roda na máquina do museu e só aceita comandos de dentro daquela rede; o app está numa VPS em São Paulo, que não alcança lá. O agente inverte o sentido da conexão — **sai** do museu para a VPS como cliente Socket.IO, e fala com o MadMapper por dentro da rede local. Dispensa IP fixo, port forwarding e mexer no firewall. **Não existe alternativa pelo navegador: browsers não enviam UDP.**

**Fluxo:** o agente entra na sala como `papel: "madmapper"`, escuta `sala1:estado` e traduz cada estado numa chave (`standby`, `menu`, `tema:<id>`, `fim-video`, `encerrando`) que o `config.json` mapeia para um endereço OSC.

**Status:** codificação OSC validada byte a byte (`npm run verificar`) e fluxo testado ponta a ponta contra servidor simulado — deduplicação, reconexão e estados sem cue configurado, todos conferidos. **Falta testar com MadMapper real.**

**Pendências:** salvar os cues no MadMapper (um por tema) e obter os nomes exatos via OSC Query, confirmar a porta OSC, e definir em qual PC do museu o agente roda. Os endereços em `config.example.json` são placeholders não verificados.

### Dimensionamento da VPS (DECIDIDO 2026-07-20)

**Plano escolhido: Hostinger VPS KVM 2 — 2 vCPU · 8 GB RAM · 100 GB NVMe · 8 TB de tráfego, datacenter em São Paulo.**

| Período | Custo |
|---|---|
| Promoção — 24 meses | **R$ 42,99/mês** (R$ 515,88/ano · R$ 1.031,76 em boleto único) |
| Após 24 meses — renovação | **R$ 77,99/mês** (R$ 935,88/ano) |

Inclui root completo, Docker/Docker Compose, backup semanal e domínio por 1 ano. Aceita **boleto e PIX**.

**Os primeiros 24 meses (R$ 1.031,76, boleto único) entram no total do orçamento** — Gabriel recebe o valor e contrata o servidor. Como é desembolso único em BRL, não há exposição cambial nem cobrança recorrente. **A renovação a partir de setembro/2028 não está inclusa e é responsabilidade do museu** — precisa assumir a conta antes do vencimento, senão o servidor cai.

**Por que Hostinger e não DigitalOcean:** o motivo original foi o **pagamento por boleto** — a DO só aceita cartão internacional em USD, e o museu precisa de boleto. Mas a troca ganhou em todos os eixos: custa ~40% do que a DO custaria (R$ 516 vs R$ 1.344/ano) entregando **4x a RAM, 2x a CPU e 2x o disco**; o datacenter em São Paulo (contra EUA) melhora de verdade a latência do sync tablet↔TV da Sala 1 e o carregamento dos vídeos; e provedor nacional **emite nota fiscal brasileira** — que a DO não emite e um museu provavelmente precisa para prestação de contas.

**HostGator descartada:** infra decente (Oracle Cloud Brasil, root, Docker), mas o plano real sai a R$ 86,29/mês — o dobro da Hostinger por metade da RAM. O "a partir de R$ 21,69" da vitrine não corresponde ao plano necessário.

**⚠️ Duas armadilhas na contratação:**
1. **Tem que ser plano VPS, não hospedagem compartilhada.** Os planos de R$ 10–20/mês são cPanel/PHP e **não rodam este projeto** — ele exige processo Node permanente (Socket.IO), Postgres próprio, Docker, WebSocket e acesso root. Isso está escrito na página 3 do orçamento de propósito.
2. **Confirmar o datacenter São Paulo no ato da compra** — a região é selecionável e há relatos de contratações que caíram fora do Brasil.

**Deploy — "caminho C":** build local → `docker save | gzip` → `scp` → `docker load` no servidor. Não depende de GitHub Actions, registry nem de qualquer serviço externo, e é independente de provedor. Com 8 GB de RAM, buildar no próprio servidor virou plano reserva viável — o build do Next mede **16 segundos** neste projeto, então a preocupação com RAM de build deixou de existir.

**Melhorias técnicas pendentes** (nenhuma bloqueante, todas válidas):
1. **Caddy servindo estáticos direto** — hoje o `Caddyfile` faz `reverse_proxy web:3000` para *tudo*, então os 42 MB de vídeo da Sala 1 e as mídias dos depoimentos passam pelo Node. Precisa de `handle_path /videos/*` e `/uploads/*` com `file_server`
2. **Limite de tamanho no upload de vídeo** — `lib/uploads.ts` faz `arrayBuffer()` do arquivo inteiro em memória, sem limite; travar em ~20 MB no client e no server
3. **Enxugar o Dockerfile** — copia o `node_modules` inteiro (522 MB; só 9 das 21 deps são de produção) e o `.next` com cache, gerando imagem de mais de 1 GB. `npm ci --omit=dev` no estágio final deve levar a ~250–350 MB e acelerar muito o deploy

---

## Dependência Crítica: Escada → Sala 7 (RESOLVIDA)

Com a decisão de hospedar em VPS (internet estável confirmada no museu), esta dependência segue o mesmo modelo da sincronização Sala 1 (tablet↔TV): a Escada envia a foto/vídeo pro servidor central (VPS), que grava no Postgres/volume e notifica a Sala 7 em tempo real via WebSocket. PCs ficam independentes entre si, dependendo apenas da internet do museu — equivalente à antiga "Opção B", mas usando a mesma infra Docker do resto do projeto em vez de um serviço terceiro (Supabase).

---

## Dúvidas em Aberto

| # | Dúvida | Impacto |
|---|---|---|
| 1 | Qual PC será usado em cada sala? (specs, OS) | Garante compatibilidade do app |
| 2 | Quando Gabriel terá acesso ao tablet para testes físicos? | Testes de webcam, touch, modo kiosk |
| 3 | Conteúdo dos vídeos da Sala 1 — quem fornece e em qual formato? | Precisa estar pronto antes da Sala 1 estar completa (recebido só o template/estrutura até agora) |
| 4 | Conteúdo do assistente virtual da Sala 8 — os textos completos de cada tema? | Precisa estar pronto antes da Sala 8 estar completa |
| 5 | Data exata da inauguração? | Define deadline real |
| 6 | Haverá alguém do museu treinado para operação básica (religar cabo, reiniciar tablet)? | Define o nível do documento de operação a entregar |
| ~~7~~ | ~~Qual VPS/provedor será usado e quem paga por ela?~~ | ✅ **RESOLVIDA (2026-07-20):** Hostinger VPS KVM 2 (São Paulo), R$ 42,99/mês por 24 meses; conta aberta e paga por boleto pelo próprio museu. Ver "Dimensionamento da VPS" acima. |
| 8 | Nomes exatos dos cues no MadMapper, porta OSC, e em qual PC do museu roda o agente | Necessários para configurar `apps/agente-madmapper/config.json`. O trigger é da **Sala 1**. |

---

## Orçamento de Gabriel

**✅ Fechado em 2026-07-20.** Documento entregável: `orcamento_gabriel_leao.pdf` na raiz (template de 7 páginas; páginas 2 "Mão de Obra", 3 "Custo de Hospedagem" e 4 "Forma de Pagamento" preenchidas). Backup do template em branco: `orcamento_gabriel_leao.BACKUP.pdf`.

```
HONORÁRIO DE DESENVOLVIMENTO
  Desenvolvimento dos 3 sistemas         R$ 4.500,00
  (~116h estimadas → ~R$ 39/h)

HOSPEDAGEM (primeiros 24 meses, boleto único)
  Hostinger VPS KVM 2                    R$ 1.031,76

FORMA DE PAGAMENTO
  TOTAL — pagamento único na assinatura  R$ 5.531,76
  PIX ou transferência, até 5 dias úteis

DESPESAS REEMBOLSÁVEIS (cobradas separadamente)
  Deslocamento a Piranhas (2 viagens)    a calcular
  Hospedagem (estimativa 2 noites × 2)   a calcular

SUPORTE PÓS-INAUGURAÇÃO (opcional — propor ao cliente)
  Suporte por 3 meses                    R$ 300/mês
```

**O boleto único dos primeiros 24 meses de hospedagem ENTRA no total** — Gabriel recebe e contrata o servidor. A **renovação a partir de setembro/2028 (R$ 77,99/mês) não está inclusa e é responsabilidade do museu**, que precisa assumir a conta antes do vencimento. Piso defensável de honorário caso o museu peça revisão: R$ 4.000.

**Estimativa de horas de desenvolvimento:**

| Entrega | Horas |
|---|---|
| Setup do projeto, banco, estrutura | 8h |
| Sala 1 (kiosk + MadMapper) | 20h |
| Sala 8 (assistente virtual) | 16h |
| Escada (foto/vídeo + webcam) | 32h |
| Sala 7 (galeria em tempo real) | 12h |
| Modo kiosk, PM2, deploy nos dispositivos | 8h |
| Testes e correções | 20h |
| **Total** | **~116h** |

---

## Cronograma

| Período | Entrega |
|---|---|
| Julho semanas 1-2 | Setup + componentes base (UI de totem: touch-friendly, tipografia grande) |
| Julho semana 3 | Sala 1 — kiosk de vídeo + integração MadMapper |
| Julho semana 4 | Sala 8 — assistente virtual |
| Agosto semanas 1-2 | Escada — captura foto/vídeo, fluxo completo |
| Agosto semana 3 | Sala 7 — galeria em tempo real |
| Agosto semana 4 | Integração, modo kiosk, PM2, testes |
| Setembro | Buffer: testes no espaço físico, calibração com MadMapper, inauguração |

---

## Notas Técnicas

- **MadMapper:** controlado por **OSC sobre UDP**, endereços tipo `/presets/Cue 1`, porta configurável nas preferências, com OSC Query para listar os endereços. É usado pela **Sala 1** através do agente local em `apps/agente-madmapper/` — ver seção "Integração MadMapper (Sala 1)".
- **Docker Compose:** 3 serviços — `web` (Next.js + Socket.IO), `db` (Postgres), `caddy` (reverse proxy/TLS). Mesma stack sobe em VPS ou localmente.
- **Chromium kiosk da TV precisa da flag `--autoplay-policy=no-user-gesture-required`** — a TV troca de vídeo sozinha (via WebSocket, sem clique/touch), e navegadores bloqueiam autoplay com som sem essa flag ou uma interação prévia do usuário. Sem ela, o vídeo troca mas não toca.
- **AnyDesk:** instalado em cada PC para acesso remoto de Gabriel em caso de problema físico no dispositivo
- **LGPD:** com a mudança para VPS, fotos e vídeos dos visitantes (Escada) passam a trafegar e ficar armazenados no servidor central — revisar política de privacidade/termo de uso de imagem considerando esse armazenamento remoto (antes seria só local)
- **HTTPS é obrigatório para a webcam da Escada.** `getUserMedia` (captura de câmera no navegador) só funciona em "contexto seguro" — HTTPS ou `localhost`. Em produção na VPS, isso significa que precisa de um domínio público real apontando pro IP da VPS, definido em `.env` (`DOMAIN=...`, ver `.env.example`) — o Caddy emite certificado Let's Encrypt automaticamente para esse domínio (`Caddyfile`). Para testar a Escada numa rede local sem domínio público (ex: mini PC + tablet na mesma rede do museu antes de ter DNS configurado), usar `docker compose -f docker-compose.yml -f docker-compose.local-tls.yml up -d`, que sobe o Caddy com certificado autoassinado (`Caddyfile.local` + `tls internal`) — os dispositivos vão precisar confiar nesse certificado manualmente uma vez (aviso de "conexão não segura" no Chromium, aceitar/prosseguir) já que não é validado por uma CA pública.
