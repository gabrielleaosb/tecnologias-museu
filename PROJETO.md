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
Tablet exibe tela em loop de boas-vindas. Visitante seleciona um tema. Um vídeo sobre o tema é reproduzido. Ao terminar, volta ao loop. Em sincronia, o sistema aciona o MadMapper para iluminar/projetar na maquete física conforme o tema escolhido.

**Temas:**
- Cangaço
- A Cidade
- Rio São Francisco
- A Ferrovia

**Dispositivos:** 2 telas físicas sincronizadas — um **tablet** (interação do visitante) e uma **TV** (onde o vídeo do tema realmente toca). A Sala 1 **não** integra com o MadMapper — essa integração é de outra sala (a definir).

**Fluxo:**  
`Tablet: loop de boas-vindas → visitante seleciona tema` → `TV: troca do loop para o vídeo do tema → ao terminar, volta ao loop` → `Tablet: volta à tela de seleção`

Sincronização tablet ↔ TV em tempo real via WebSocket (Socket.IO), mediada pelo servidor.

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
/sala8        → Assistente virtual do Cangaço
```

### Infraestrutura (DECISÃO ATUALIZADA)

- **Hospedagem em VPS**, não mais 100% local — confirmado que o museu terá internet estável
- App rodando via **Docker Compose** na VPS; a mesma imagem pode subir localmente se necessário (portabilidade mantida)
- **AnyDesk** mantido nos PCs físicos para manutenção/suporte
- Cada dispositivo (tablet, TV, totem) é um cliente (browser em modo kiosk) que se conecta à VPS
- Sincronização entre telas da mesma sala (Sala 1: tablet↔TV; Escada→Sala7) passa a ser feita **pelo servidor central na VPS** via WebSocket, não mais por rede local do museu
- MadMapper (outra sala, fora do escopo da Sala 1) segue como integração local — arquitetura de trigger a definir quando a sala responsável for detalhada

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
| 7 | Qual VPS/provedor será usado e quem paga por ela? | Define custo recorrente de infra (fora do orçamento original) |
| 8 | Qual sala/dispositivo é responsável pelo trigger do MadMapper? | Sala 1 foi descartada dessa integração; precisa mapear qual sala assume |

---

## Orçamento de Gabriel

```
HONORÁRIOS DE DESENVOLVIMENTO
  Desenvolvimento dos 3 sistemas         R$ 3.000 – R$ 5.000

DESPESAS REEMBOLSÁVEIS (cobradas separadamente)
  Deslocamento a Piranhas (2 viagens)    a calcular
  Hospedagem (estimativa 2 noites × 2)  a calcular

SUPORTE PÓS-INAUGURAÇÃO (opcional — propor ao cliente)
  Suporte por 3 meses                    R$ 300/mês
```

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

- **MadMapper API:** porta 8080, trigger via HTTP GET, ex. `GET http://localhost:8080/action?name=cangaco`. Não é usada pela Sala 1 — pertence a outra sala, a mapear.
- **Docker Compose:** 3 serviços — `web` (Next.js + Socket.IO), `db` (Postgres), `caddy` (reverse proxy/TLS). Mesma stack sobe em VPS ou localmente.
- **AnyDesk:** instalado em cada PC para acesso remoto de Gabriel em caso de problema físico no dispositivo
- **LGPD:** com a mudança para VPS, fotos e vídeos dos visitantes (Escada) passam a trafegar e ficar armazenados no servidor central — revisar política de privacidade/termo de uso de imagem considerando esse armazenamento remoto (antes seria só local)
