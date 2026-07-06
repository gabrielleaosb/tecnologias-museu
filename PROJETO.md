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

**Integração física:**  
- Projeção mapeada: **MadMapper** (software externo, fora do escopo de desenvolvimento)
- Trigger: o app faz uma chamada HTTP para a API local do MadMapper (`http://localhost:8080`) ao selecionar um tema
- Iluminação da maquete: fora do escopo

**Fluxo:**  
`Loop boas-vindas → Seleção de tema → Vídeo toca → Fim do vídeo → Volta ao loop`

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

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Banco de dados | SQLite (`better-sqlite3`) |
| Armazenamento de mídia | Disco local (`/public/uploads`) |
| Gerenciador de processo | PM2 (reinício automático) |
| Browser nos dispositivos | Chromium em modo kiosk (`--kiosk --noerrors`) |

### Rotas do app

```
/sala1    → Kiosk de seleção de vídeos + trigger MadMapper
/escada   → Cabine lambe-lambe (foto/vídeo)
/sala7    → Galeria de depoimentos em loop (TV)
/sala8    → Assistente virtual do Cangaço
```

### Infraestrutura

- **Tudo roda localmente** nos PCs do museu — sem dependência de internet para funcionamento
- **AnyDesk** instalado em cada PC para manutenção remota por Gabriel
- Cada dispositivo (totem, tablet, TV) tem um **PC dedicado**
- Os PCs precisam estar na **mesma rede interna** do museu para a sincronização Escada → Sala 7

---

## Dependência Crítica: Escada → Sala 7

Esta é a única comunicação entre dispositivos distintos no projeto. Três opções foram levantadas:

### Opção A — Um PC faz papel de servidor (recomendada se rede interna confirmada)
O PC da Sala 7 roda o servidor Next.js. O PC da Escada envia fotos/vídeos para o IP local da Sala 7. Todos na mesma rede Wi-Fi do museu.
- Sem internet, sem custo adicional
- Se o PC da Sala 7 desligar, Escada também para

### Opção B — Backend em nuvem só para sincronização (recomendada se rede interna incerta)
Supabase (plano gratuito) armazena fotos/vídeos. Escada envia, Sala 7 busca em tempo real.
- PCs completamente independentes entre si
- Requer internet funcionando no museu apenas para essa feature

### Opção C — Pasta compartilhada em rede
Escada salva numa pasta de rede Windows. Sala 7 monitora a pasta.
- Solução mais simples de implementar
- Configuração de rede Windows pode ser frágil em produção

**⚠️ DECISÃO PENDENTE:** Aguardando reunião com o museu para confirmar se todos os PCs estarão na mesma rede Wi-Fi interna. Essa resposta define qual opção seguir.

---

## Dúvidas em Aberto

| # | Dúvida | Impacto |
|---|---|---|
| 1 | Os PCs de todos os dispositivos estarão na mesma rede Wi-Fi interna do museu? | Define arquitetura de sincronização Escada → Sala 7 |
| 2 | Qual PC será usado em cada sala? (specs, OS) | Garante compatibilidade do app |
| 3 | Quando Gabriel terá acesso ao tablet para testes físicos? | Testes de webcam, touch, modo kiosk |
| 4 | Conteúdo dos vídeos da Sala 1 — quem fornece e em qual formato? | Precisa estar pronto antes da Sala 1 estar completa |
| 5 | Conteúdo do assistente virtual da Sala 8 — os textos completos de cada tema? | Precisa estar pronto antes da Sala 8 estar completa |
| 6 | Data exata da inauguração? | Define deadline real |
| 7 | Haverá alguém do museu treinado para operação básica (religar cabo, reiniciar tablet)? | Define o nível do documento de operação a entregar |

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

- **MadMapper API:** porta 8080, trigger via HTTP GET. Ex: `GET http://localhost:8080/action?name=cangaco`
- **PM2:** gerencia o processo Node.js, reinicia automaticamente em crash, sobe junto com o PC no boot
- **AnyDesk:** instalado em cada PC para acesso remoto de Gabriel em caso de problema
- **LGPD:** fotos e vídeos dos visitantes ficam armazenados localmente, sem envio para nuvem (exceto se Opção B for escolhida para sincronização — avaliar política de privacidade nesse caso)
