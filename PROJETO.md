# Museu do Sertão de Piranhas — Documento de Projeto

## Visão Geral

Sistema interativo para o Museu do Sertão de Piranhas, Alagoas. Composto por 4 sistemas independentes (com exceção de uma dependência entre Escada e Sala 7) entregues como um único app web rodando localmente nos dispositivos do museu.

**Desenvolvedor:** Gabriel (solo) + Claude  
**Data de inauguração:** Setembro de 2026 (provável segunda quinzena, data não confirmada)  
**Contrato:** Projeto já vendido pela empresa. Gabriel define seu próprio honorário.  
**Honorário estimado:** R$ 3.000 – R$ 5.000 (desenvolvimento)  
**Despesas de deslocamento:** reembolsáveis por fora do honorário  

---

## Os 4 Sistemas

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

**✅ Admin refeito (2026-08-06):** o Admin (`/admin` e `/admin/login`) foi reconstruído com fidelidade ao protótipo e a Escada foi padronizada junto. Fica registrado que a tela de **login não tem design de referência no PDF** (só a lista de depoimentos foi prototipada), então ela segue um visual derivado do resto do sistema, não do protótipo.

**✅ Adequações pra hardware físico (2026-07-16):** com a definição do hardware real da cabine (webcam USB + monitor touch + mini PC), foram resolvidas 4 lacunas que impediriam o funcionamento em produção:
1. **HTTPS** — `getUserMedia` (captura de câmera) exige contexto seguro; Caddy agora emite certificado automático via domínio (`DOMAIN` no `.env` da raiz), com `Caddyfile.local` como alternativa self-signed pra testes em rede local sem domínio público. Ver seção "Notas Técnicas" abaixo.
2. **Teclado virtual em tela** — removido em 2026-08-06 (commit `4756a1e`) e **restaurado em 2026-08-24** em `components/TecladoVirtual.tsx`, agora compartilhado entre a Escada e a Sala 6. Ver a seção "Teclado on-screen" abaixo.
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

**✅ Fidelidade: `TelaOrigem`, `TelaTexto`, `TelaCaptura`, `TelaPreview`, `TelaAgradecimento` (2026-08-06) e `TelaAutorizacao` (2026-08-12)** — medidas aplicadas a partir do XD, mesma abordagem de TelaBoasVindas e TelaEscolha.

**✅ Correção de escala tipográfica (2026-08-24) — a mais significativa desde o início.** Relendo o PDF página a página apareceu que **o texto estava sistematicamente ~40% menor que o protótipo**: o token `texto.corpo` valia 1,35vw (26px) contra os 43,4px do arquivo. O PDF trabalha com três tamanhos e quase nada fora deles, agora refletidos nos tokens de `lib/escada/estilos.ts`:

| No PDF | Token | Onde |
|---|---|---|
| 43,4px (2,26vw) | `texto.corpo` | texto corrido de captura, preview e texto |
| 39,5px (2,06vw) | `texto.titulo` / `texto.secundario` | títulos e chamadas das telas de formulário |
| 37,7px (1,96vw) | `texto.rotulo` **(novo)** | rótulos de botão e contadores |
| 36,5px (1,9vw) | `campo.fontSize`, `navegacao.tamanhoTexto` | campos e ANTERIOR/PRÓXIMO |

**Duas telas quebraram com o texto no tamanho certo, e as duas por motivo de largura, não de altura:**
- **Captura:** os rótulos dos botões estavam usando o tamanho de texto corrido; com 43px o ANTERIOR era empurrado para fora da tela, que não rola. Passaram a `texto.rotulo`, e a faixa central ganhou `min-h-0` para poder encolher em vez de empurrar. **A tela foi refeita depois — ver abaixo.**

**✅ Telas de captura refeitas (2026-08-24), a partir de `design/escada/Telafoto.jpeg` e `Telavideo.jpeg`.** São referências novas, mais recentes que o PDF, e definem um arranjo que a tela não seguia: logo **horizontal** no alto à esquerda, prévia da câmera 16:9 ocupando a metade esquerda, e uma coluna à direita com texto, botões e — no vídeo — cronômetro, barra e legenda.

- Cada peça é posicionada por coordenada. Antes era uma grade de duas colunas centralizada verticalmente, o que fazia prévia e texto flutuarem conforme o tamanho do parágrafo — e o parágrafo muda entre foto e vídeo. É a mesma armadilha da tela de autorização.
- **Os PNGs dos botões já são os botões inteiros.** `fotografar.png` é o círculo bege com a câmera dentro; `pause.png` é o quadrado arredondado com o quadrado escuro. O código punha o ícone pequeno dentro de um círculo bege feito em CSS — dava um botão dentro do outro. Agora a imagem ocupa o botão todo, sem fundo por baixo.
- **A largura da coluna de texto é o que define as quebras.** Nas referências o parágrafo tem quatro linhas nas duas telas. Corpo do texto e largura da coluna andam juntos: ao reduzir o texto de 45,5 para 42px, a coluna caiu de 690 para 637 na mesma proporção — sem isso a tela de foto passava para três linhas e o bloco ficava largo e achatado.
- **FOTO, GRAVAR e PARAR no meio do parágrafo não são negrito** — só caixa-alta. Conferido ampliando as referências: apenas a primeira linha (o título) é bold; as palavras dentro do texto têm o mesmo peso do restante e só parecem mais fortes porque caixa-alta lê mais denso.
- Título e parágrafo são **um bloco só**: nas referências a primeira linha é a mesma linha em negrito, com o mesmo corpo e a mesma entrelinha — não um título separado com respiro próprio. O bloco começa mais alto no vídeo, que tem uma linha a mais.
- **Bug de lint resolvido de verdade, não silenciado:** `react-hooks/refs` acusava acesso a ref durante o render em `camera.contagemRegressiva`. O objeto devolvido por `useCamera` carrega um ref (`videoRef`), e ler *qualquer* campo dele no corpo do componente dispara a regra, mesmo em campos que são estado comum. Desestruturar o hook resolve.
- **Preview:** a grade tinha `maxWidth: 53,33vw`, deixando ~490px por coluna contra os **722px da p.15**. O mesmo parágrafo quebrava em quase o dobro de linhas e os botões CANCELAR e TIRAR OUTRA FOTO saíam pela borda. Largura corrigida para 77,3vw.

**✅ Outras correções da mesma passada:**
- **O valor digitado nos campos sai em Heavy**, não no Medium do protótipo. É desvio pedido: com valor e placeholder no mesmo peso, não dava para saber o que já tinha sido preenchido. Vale para nome, e-mail e para o país/estado escolhidos; o placeholder segue em Medium.
- **Respiro entre os campos**: 32px (`607 − 517 − 58` na p.3), contra os 12px que estavam.
- **Rótulos PAÍS e ESTADO em Demi**, não Bold.
- **Tela de texto refeita pela p.18/19**, que ela não seguia: título centralizado em três linhas com "(Opcional)" em Book na própria linha; caixa de 1161×305 posicionada; contador em **duas linhas à direita da caixa**, em `#996742` — estava embaixo, pequeno e na cor errada; PRÓXIMO no alto à direita, e não no meio da lateral.
- **Tela de autorização refeita pelas p.7 e p.8.** Ela era montada em fluxo — ícone, título, chamada e caixa empilhados numa coluna, empurrados por uma margem única calibrada no olho (`espacoAbaixoDoIcone: 29.57vh`). Bastava o nome do visitante mudar de tamanho para o conjunto inteiro escorregar. Agora cada peça sai da coordenada do PDF, o que reproduz as duas metades que o protótipo define: **em cima o ícone e o texto "Nome, falta pouco…"; embaixo a chamada "Clique aqui para permitir o uso." e a caixa "Eu autorizo"**. Conferido no navegador: título em y=362, chamada em 657 e caixa em 356×809 de 1209×99 — os números do arquivo.
  - Os dois ícones **não começam na mesma altura** no protótipo: o de vídeo mede 156×156 e o de foto 162×131, e o de foto desce 20px para os dois terminarem na mesma linha acima do texto.
  - A chamada e o texto da caixa são **53,4px**, bem maiores que o resto da tela — é o maior corpo de texto do PDF inteiro.
  - **O campo de nome não tem limite de tamanho** (a Sala 6 tem, 24 caracteres). Com a linha travada em `nowrap`, um nome comprido empurrava o texto para fora da tela pelos dois lados; agora ele quebra. Testado com 55 caracteres: o título quebra dentro da tela e a caixa não sai do lugar. **Pôr um teto no campo continua sendo o conserto na origem.**
  - O título é ancorado nas **duas** laterais (`left` e `right`), e não centralizado por `left: 50%`: com um lado só, a largura disponível para um elemento posicionado vira a metade da tela, e a frase quebrava em três linhas mesmo cabendo em duas.
  - **A bolinha desmarcada ganhou um anel escuro.** No protótipo ela é um disco branco sólido, que sobre o tom claro da caixa lê como *já marcada* — e num termo de uso de imagem não pode restar dúvida sobre o que o visitante consentiu. O estado sempre esteve correto no código (`autorizacaoImagem: false`, com o PRÓXIMO bloqueado); o que enganava era só o desenho.
  - **A metade de cima sobe 40px** em relação ao protótipo, por `SUBIDA` — no arquivo sobra muito ar entre o ícone e o texto. Ícone e texto sobem juntos, então a distância entre eles não muda; é o único número a mexer para calibrar.
- **ANTERIOR / PRÓXIMO (`Navegacao.tsx`), nas quatro telas que os usam:**
  - **As duas setas passaram a ser o mesmo arquivo.** O ANTERIOR usava `voltar1.png` e o PRÓXIMO `seta2.png` — desenhos diferentes, que lado a lado não combinavam. Agora a da esquerda é a mesma seta **espelhada** por `scaleX(-1)`, o que garante peso, espessura e proporção idênticos sem depender de dois arquivos continuarem parecidos.
  - **Recuo de 100px das bordas.** O PDF os põe a 145px (seta esquerda em x=145, direita terminando em 1775), mas na tela real isso afasta demais os botões do conteúdo; 100px é o meio-termo escolhido, contra os 32px de antes, que os deixavam quase colados no canto. É desvio deliberado do protótipo, e o valor está num token só (`navegacao.recuo`) — mexer nele reposiciona as quatro telas do par **e** o PRÓXIMO da tela de texto de uma vez.
  - **Seta de 61px, contra os 29px de antes.** Os PNGs são quadrados de 401×401 com a seta ocupando ~80% da altura e ~51% da largura do quadro; numa caixa de 61 ela sai com 31×49, a medida exata do protótipo. **O texto não mudou** — segue em 36,5px.
  - Vale para as duas formas de posicionamento do componente: o modo centralizado (informações, origem, autorização) e o em fluxo (captura). Conferido nas quatro: 145 e 1775 em todas.
  - A tela de texto tem PRÓXIMO próprio, menor, e a seta acompanha: 28×43 no PDF, caixa de 54.
- **Painel de países:** nomes longos vazavam para fora do botão e invadiam o vizinho — "República Democrática do Congo" tem 30 caracteres contra os ~14 que cabiam na coluna. Agora quebram em duas linhas, com altura mínima em vez de fixa. Conferido: **nenhum dos 195 países transborda.**

**⚠️ Próxima alteração planejada:** com todas as telas do fluxo já cobertas, o que resta na Escada não é mais fidelidade e sim **validação no hardware real** — touch, resolução do monitor da cabine, webcam USB e permissão de câmera persistindo entre reboots (checklist em `OPERACAO-CABINE.md`).

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

**Interação por voz (2026-07-30):** ao contrário das outras salas (touch), a Sala 8 é operada por voz — o visitante fala perto de um microfone e navega respondendo SIM/NÃO ou números (um a cinco). Sem síntese de voz (TTS): a resposta do personagem é só visual (vídeo/texto na tela), só a entrada é por voz. A área do microfone será fisicamente semi-isolada do salão pra reduzir ruído ambiente.

**✅ Protótipo de reconhecimento de voz:** implementado em `/sala8/teste-voz`, usando a Web Speech API nativa do navegador (`SpeechRecognition`, `lang: "pt-BR"`) — sem infra extra, sem custo. A lógica de casamento de comando (normalização de texto + fuzzy match por distância de edição contra o vocabulário fechado sim/não/um-cinco) fica isolada em `lib/sala8/reconhecimentoVoz.ts`.

**⚠️ Achado crítico: exige Google Chrome real, não Chromium puro.** A Web Speech API depende do serviço de nuvem do Google, acessado por uma chave de API que só vem embutida no Chrome oficial. Testado e confirmado em 2026-07-30: no Chromium puro (o mesmo binário hoje documentado no kiosk das outras salas, `chromium --kiosk`) e no Brave, o reconhecimento trava indefinidamente sem nenhum evento disparar; no Google Chrome real, o pipeline funciona normalmente (`start` → `audiostart` → `soundstart` → `speechstart`). **Implicação:** o PC da Sala 8 vai precisar rodar `google-chrome-stable --kiosk` em vez de `chromium --kiosk` — única sala com essa exigência. Ainda não validada a taxa de acerto com fala real (o teste automatizado só confirma que a infraestrutura conecta, não a precisão).

**⚠️ Achado: "um" isolado NUNCA é reconhecido — comandos numéricos são pedidos como "número um" (2026-08-04).** Testado com fala real no Chrome: `dois`, `três`, `quatro`, `cinco`, `sim` e `não` funcionam soltos, mas `um` sozinho não produz nem hipótese parcial. São ~200ms de som nasal sem consoante de ataque, que o reconhecedor genérico modela como hesitação e descarta. Falar `"um um um"` funciona — logo é limiar de duração de áudio, não a palavra em si. **Decisão: o personagem pede "número um", "número dois", … e a tela segue mostrando os algarismos** (testado: tanto `"número um"` quanto `"opção um"` passam; o "número" foi escolhido por casar com o que o visitante lê na tela). A frase canônica de cada comando está em `FRASE_SUGERIDA`, em `lib/sala8/reconhecimentoVoz.ts` — usar essa constante ao montar as telas do fluxo real. Falar só o número continua aceito de 2 a 5.

**Não tem correção por código, e trocar de API não resolveria sozinho.** A Web Speech API não expõe nenhum controle de endpointing, duração mínima ou limiar de confiança; a spec prevê `SpeechGrammarList` (gramática restrita, que resolveria o caso — nosso vocabulário tem 7 palavras) mas no Chrome é um stub sem efeito. Qualquer STT de vocabulário aberto tem o mesmo viés contra monossílabo isolado (o Whisper é notoriamente pior nisso). Só resolveria de fato um motor com **vocabulário restrito de verdade**: Vosk (offline, plano B abaixo), Picovoice (feito para comando curto, licença comercial) ou STT em nuvem com phrase hints (Google Cloud STT, Azure, Deepgram — pagos por minuto, custo recorrente permanente num totem que escuta o dia inteiro). Não compensa trocar por causa de uma palavra quando a frase mais longa resolve a custo zero.

**Casamento de comando — o último vale.** Quando a transcrição traz mais de um comando (`"um dois"`), vale o ÚLTIMO, não o primeiro. Isso aparece na prática porque o Chrome não fecha a frase num monossílabo e gruda a palavra seguinte na mesma transcrição. Também cobre correção em voz alta ("não, quer dizer, sim"). A POC ainda aceita o comando já na **hipótese interina**, sem esperar o Chrome finalizar, reiniciando o reconhecedor em seguida para limpar o buffer — sem isso a palavra antiga reaparece no resultado seguinte.

**Alternativa considerada, não adotada por ora:** reconhecimento no servidor via motor offline com gramática restrita (ex: Vosk), com o navegador só capturando áudio — independe de navegador/fabricante, mas exige bem mais horas de implementação. Fica como plano B caso a precisão do Chrome real fique abaixo do aceitável em campo.

**Pendências:** roteiro completo do fluxo ainda não recebido (há um rascunho parcial em `TECNOLOGIAS.md`, seção "Tecnologia Sala 8") — quando chegar, os pedidos de número precisam sair como "número um", ver achado acima; textos completos de cada tema (dúvida em aberto #4); validação de precisão **com ruído de ambiente** (os testes até aqui foram em silêncio — se a precisão geral cair no salão, aí sim o Vosk volta à mesa, por precisão geral e não por uma palavra).

---

### 4. Sala 6 — Jogo da Memória

**Adicionada ao escopo em 2026-08-24.**

**O que faz:**
Totem touch com um jogo da memória sobre paleontologia e biomas do sertão — o visitante encontra pares de cartas com animais, fósseis e plantas da região, contra um relógio, e entra num ranking.

**✅ Implementada em 2026-08-24, a partir do PDF `design/sala6/Jogo da memoria.pdf` (11 páginas).** As 7 telas foram construídas e conferidas uma a uma no navegador contra o protótipo.

**As 7 telas** (página do PDF entre parênteses): menu (p.1), novo jogo (p.2), tabuleiro fácil (p.3/4), tabuleiro difícil (p.7/8), "recomeçar?" (p.5), "você venceu!" (p.9), "você perdeu" (p.10) e ranking geral (p.11).

**⚠️ São 2 dificuldades no protótipo, não 3.** O pedido inicial falava em três níveis, mas o PDF define **apenas FÁCIL e DIFÍCIL** — e o ranking da p.11 tem exatamente duas colunas, "MODO FÁCIL" e "MODO DIFÍCIL". Foi implementado o que o protótipo mostra. Acrescentar um nível intermediário é uma entrada nova em `DIFICULDADES` (`lib/sala6/dificuldades.ts`) mais uma coluna no ranking; o resto do código não distingue níveis por nome, então nada mais precisa mudar. **Falta decidir se o terceiro nível entra ou se dois era mesmo a intenção.**

| Nível | Grade | Pares | Tempo |
|---|---|---|---|
| Fácil | 6 × 3 | 9 (das 16 cartas) | 2:00 |
| Difícil | 8 × 4 | 16 (todas) | 3:00 |

**Ranking:** tabela `pontuacoes_sala6` no Postgres, uma linha por partida **vencida** — quem perde no tempo não pontua, e é por isso que comparar tempos entre as linhas é justo. Ordenado por tempo crescente, com a data como desempate. **É por dificuldade, e não um placar único:** uma partida de 9 pares e uma de 16 não são comparáveis. API em `app/api/sala6/ranking/route.ts` (GET devolve as duas colunas prontas; POST grava). O nome do jogador é digitado na tela de novo jogo, e não no fim — como no protótipo.

**Como as medidas foram extraídas:** o PDF vem num canvas de 1920×1080, o mesmo do XD das outras salas, e é **vetorial** — então cores, posições, tamanhos e tipografia foram lidos dos objetos do arquivo em vez de amostrados na imagem renderizada. Isso importa porque a renderização mistura as camadas translúcidas e devolve cores que não existem no arquivo. A entreletra foi calculada comparando a largura de cada trecho com a largura natural da mesma string na Futura PT real (de `public/fonts/`): **27 dos 29 trechos medidos caem em 0,19–0,20em ou 0,49–0,50em**, o que mostra que são dois valores escolhidos, não variação. Os três níveis viraram `TRACKING` em `lib/sala6/medidas.ts`.

**Unidade de medida:** `d(px)` em `lib/sala6/medidas.ts` converte direto o número lido do PDF, sobre `--u: min(1vw, 1.7778vh)`. Cada tela é uma composição fechada de 16:9 que precisa caber inteira sem rolagem, então a unidade é limitada pelos dois eixos e o canvas fica centralizado — em tela fora de 16:9 sobra faixa, que é o certo, já que esticar desalinharia a grade de cartas em relação ao cabeçalho. Diferente do Admin, não há teto em pixels: o totem é tela cheia.

**Arquitetura — o que esta sala não tem:** é **uma tela só, autocontida**. Sem sincronização entre dispositivos (nada de tablet↔TV como a Sala 1, nem Escada→Sala 7), portanto **sem Socket.IO**. O servidor só entra para gravar e ler o ranking. Também **não exige HTTPS por motivo de hardware** (sem câmera, sem microfone), embora rode sob o mesmo Caddy.

**Detalhes dos assets que mudaram o desenho do código:**
- **A face da carta é a imagem inteira.** Os arquivos em `public/images/sala6/` já trazem a arte, o nome popular e o nome científico embutidos — no PDF a carta virada é uma imagem achatada, não texto sobre foto. Não há legenda a renderizar.
- **O verso também é asset pronto** (`peca-facil.png` / `peca-dificil.png`), com a logo já esmaecida dentro.
- **As casinhas de VOLTAR/SAIR/MENU trazem o rótulo desenhado no PNG** (134×218 = 67×109 no canvas, ícone + rótulo). Por isso `components/sala6/Casa.tsx` só posiciona a imagem, sem texto nem cor — a variante certa é escolhida pelo arquivo.
- **A coroa do 1º lugar não veio como asset** e é desenhada em SVG.
- **A logo horizontal da p.11 não veio** (só as verticais bege e marrom). Está a vertical no mesmo alinhamento à direita até a horizontal chegar.
- `sair-marrom-claro.png` não é usado por nenhuma tela do PDF.

**Nomes dos arquivos foram normalizados** (`"Jogo da memoria_Preguiça Gigante.jpg"` → `preguica-gigante.jpg`, `"Peça Fácil@2x.png"` → `peca-facil.png`), seguindo o que já se fez na Sala 1.

**Decisão de lógica que vale registrar:** o toque numa carta não lê o estado do tabuleiro — ele só descreve a intenção, e quem decide é o atualizador de estado. Isso foi encontrado testando: **dois toques no mesmo tique do JavaScript caem no mesmo lote de atualização do React**, e se o handler lesse o estado da renderização, ambos leriam o tabuleiro anterior e a segunda carta apagaria a primeira em vez de formar par. Num totem touch onde criança bate na tela, um toque duplo rápido cai exatamente nesse caso. Pelo mesmo motivo, o desfecho da partida (venceu/perdeu) é **derivado** do tabuleiro em vez de guardado — guardá-lo abriria a possibilidade de ele discordar das cartas.

**Pendências:** decidir sobre o terceiro nível (acima); confirmar se o ranking acumula desde a inauguração ou zera periodicamente; logo horizontal da p.11. **As 16 imagens somam ~20 MB** e hoje entram na imagem Docker — servi-las pelo Caddy junto com `/videos` e `/uploads` é o mesmo corte já feito na melhoria 1 da lista de VPS.

**Ajustes de 2026-08-24, depois de rodar o fluxo:**
- **O nome do jogador é zerado em toda saída para o menu.** Antes ele sobrevivia entre visitantes: além de confuso, fazia a pontuação de quem vencesse entrar no ranking com o nome de outra pessoa.
- **O painel central desce até o rodapé**, e não até o `y=930` do PDF — ali o protótipo abre espaço para o teclado do sistema, mas como o teclado é sobreposto, o painel interrompido deixava uma faixa de fundo solta embaixo. Só a altura mudou: todo o conteúdo é posicionado em relação à página, não ao painel.
- **A casinha de SAIR tem área de toque de 147×189**, contra os 67×109 desenhados, por preenchimento com a posição recuada no mesmo valor — cresce sem o ícone sair do lugar. **40 é o teto:** no tabuleiro difícil sobram 12px até a primeira carta, e mais que isso faria a casinha engolir toques que deveriam virar carta.
- **`touch-action: manipulation` na sala inteira**, senão o navegador segura cada toque ~300ms esperando ver se vira duplo-toque de zoom — atraso que num jogo contra o relógio ainda come tempo da partida.
- **Teclado embutido na tela de novo jogo** — ver a seção "Teclado on-screen".

**⚠️ Impacto no orçamento:** o orçamento foi fechado em 2026-07-20 com **3 sistemas** (~116h / R$ 4.500). A Sala 6 é escopo novo, não coberto por aquele documento — estimativa preliminar de **14–20h** (jogo + ranking + persistência + fidelidade visual). Precisa ser conversado com a empresa antes de entrar como trabalho não remunerado. Ver seção "Orçamento de Gabriel" abaixo.

---

## Teclado on-screen (Escada + Sala 6)

**`components/TecladoVirtual.tsx`, restaurado e compartilhado em 2026-08-24.**

**Por que existe:** os dispositivos são monitores touch sem teclado físico. Depender do teclado nativo do sistema é uma aposta que só se confere em campo — em Chromium modo kiosk o teclado do Windows não sobe sozinho sem o modo tablet configurado, e um totem onde não dá para digitar o nome é um totem parado. Sendo do app, funciona igual em qualquer SO e é testável antes da viagem. O protótipo da Sala 6 (p.2) desenha o teclado do Windows, mas ali é só ilustração.

Monta-se sozinho sobre qualquer campo de texto que receba foco — quem usa só renderiza o componente. **Os campos precisam de `inputMode="none"`**, senão o teclado do sistema abre por cima. Já aplicado nos quatro campos de digitação do projeto: nome e e-mail (`TelaInformacoes`), depoimento (`TelaTexto`) e nome de jogador (Sala 6). **PAÍS e ESTADO não entram na conta** — são o `SeletorOpcao`, que abre um painel de opções e nunca chamou teclado.

**Escreve pelo setter nativo do DOM, não por `elemento.value =`.** O React instala o próprio descritor em `value`; atribuir direto atualiza o DOM sem que ele perceba e o valor antigo volta no render seguinte. Passando pelo setter do protótipo e disparando `input`, o `onChange` do componente roda como se a pessoa tivesse digitado — inclusive as transformações que ele aplique, como o caixa-alta e o limite de 24 caracteres da Sala 6.

**A tela sobe só onde e só enquanto precisa.** O teclado devolve por `onDeslocar` quantos pixels faltam para o campo em foco escapar dele, e a tela aplica isso como `translateY`. Na Sala 6 e na tela de informações da Escada o valor é sempre zero e nada se move; no depoimento, onde sobram só **17vh** abaixo do campo, a tela sobe ~150px e volta ao lugar quando o teclado fecha. Em repouso o desenho continua sendo exatamente o que foi validado contra o protótipo.

**Duas armadilhas resolvidas, que voltam se alguém mexer:**
1. **A medida do deslocamento é de layout (`offsetTop`), não de tela (`getBoundingClientRect`).** A segunda enxerga o deslocamento que o próprio cálculo acabou de provocar: ao abrir a fileira de acentos ele mediria a tela já erguida, devolveria um valor menor, e a tela desceria de volta sobre o teclado.
2. **`input[type=email]` não suporta seleção de texto** — `selectionStart` vem nulo e `setSelectionRange` lança `InvalidStateError`. **Este era um bug real da implementação original:** cada tecla no campo de e-mail da Escada lançava exceção, e o cursor não funcionava nele. As operações de cursor agora tratam esse caso.

**A geometria é uma só, e mora no componente.** Ela ficava a cargo de quem chamava, e como a Escada e a Sala 6 medem as próprias telas em unidades diferentes (vw/vh solto contra um canvas 16:9), saía um teclado de tamanho diferente por sala. Como as duas partem do mesmo canvas de projeto 1920×1080, a unidade `min(1vw, 1.7778vh)` descreve as duas. Conferido no navegador: **tecla 98×56, área de teclas 1150px, fonte 24,5px e altura 275px, idênticos nas duas salas.**

- **Escala 28 (do canvas), calibrada pela tela mais restrita**, a de novo jogo da Sala 6: entre o fim do INICIAR (y=681) e o rodapé sobram 399, e o teclado precisa caber ali **na altura máxima** — cinco fileiras, com os acentos abertos. Encobrir o INICIAR o tornaria intocável, já que não existe tecla Enter para substituí-lo. Mexer na escala exige refazer essa conta.
- **É uma peça fechada e centralizada: acabaram as teclas, acabou o teclado** — não uma barra atravessando a tela. Esticadas na largura inteira as teclas ficariam largas e baixas, e o dedo erra a fileira antes da coluna.
- **O vão que aparece quando a tela sobe é preenchido por uma camada de fundo na Escada**, não pelo teclado. Ela precisa ficar **fora** da div que se desloca: com a cor na div que se move, ela sobe junto e o vão continua branco.
- **`ancoragem`** decide se o teclado se prende à janela (Escada, que ocupa a tela toda) ou ao ancestral posicionado (Sala 6, cujo canvas centralizado deixaria um teclado preso à janela fora de lugar).

**Pendência:** validar com dedo de verdade no monitor touch do museu. O que foi testado aqui é o comportamento (digitar, apagar, acentos, troca de campo, deslocamento, retorno ao lugar), não o acerto do toque.

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
| Browser nos dispositivos | Chromium em modo kiosk (`--kiosk --noerrors`) — **exceção: Sala 8 precisa de Google Chrome real**, ver seção Sala 8 |

### Rotas do app

```
/sala1/tablet → Tela de seleção de tema (interação do visitante)
/sala1/tv     → Tela de exibição (loop + vídeo do tema), sincronizada via WebSocket
/escada       → Cabine lambe-lambe (foto/vídeo)
/sala6        → Jogo da memória + ranking
/api/sala6/ranking → Placar por dificuldade (GET lê, POST grava a partida vencida)
/sala7        → Galeria de depoimentos em loop (TV)
/sala8        → Assistente virtual do Cangaço (ainda não implementada — fluxo completo)
/sala8/teste-voz → Protótipo isolado de reconhecimento de voz (POC, fora do fluxo final)
/admin        → Moderação dos depoimentos da Escada
/admin/login  → Autenticação do Admin
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
1. ~~**Caddy servindo estáticos direto**~~ ✅ **FEITO (2026-08-04).** `/videos/*` e `/uploads/*` passaram a ser servidos pelo Caddy com `file_server`, sem tocar no Node — que é o mesmo processo que mantém os WebSockets de sincronização das telas. Os vídeos entram por bind mount do repositório (são versionados no git) e os uploads pelo volume `uploads_data`, montado somente-leitura no Caddy. Vídeos ganharam `Cache-Control: immutable` de 1 ano. Aplicado nos dois Caddyfiles (produção e `Caddyfile.local`).
   - **A imagem caiu de 879 MB para 791 MB**, porque `public/videos` saiu junto (via `.dockerignore`). **Consequência a não esquecer: a imagem sozinha, sem o Caddy na frente, devolve 404 em `/videos/*`** — rodar o container avulso deixou de ser um teste válido da Sala 1.
   - O fallback usa `handle { reverse_proxy web:3000 }`, e não um `reverse_proxy` solto, senão ele casaria com tudo e os blocos de estático nunca seriam alcançados.
   - Validado com a stack completa no ar: vídeo responde `Server: Caddy` com `Accept-Ranges` e cache; arquivo gravado pelo `web` no volume é lido pelo Caddy; `/socket.io/` e as 6 rotas da aplicação seguem indo pro Node.
2. ~~**Limite de tamanho no upload de vídeo**~~ ✅ **FEITO (2026-08-04): teto de 25 MB** (`TAMANHO_MAXIMO_UPLOAD_BYTES` em `lib/uploads.ts`), em duas barreiras.
   - **A barreira que importa vem antes do `formData()`**, por `Content-Length`: o `request.formData()` já carrega o corpo inteiro na memória, então validar o tamanho depois dele chegaria tarde — o processo já teria absorvido o arquivo. A segunda barreira, no `salvarArquivoDepoimento`, cobre o caso do `Content-Length` não corresponder ao arquivo real dentro do multipart. Ambas respondem 413.
   - **Gravação com bitrate fixo** (`videoBitsPerSecond: 2 Mbps` em `lib/escada/useCamera.ts`): sem isso o navegador escolhia conforme a resolução da webcam e o tamanho do arquivo não era previsível. Com os 60s de limite de duração já existentes, dá ~15 MB — folga confortável dentro dos 25 MB.
   - **Bug corrigido junto, que tornava o 413 invisível:** o `fetch` de envio em `app/escada/page.tsx` nunca checava a resposta e o `finally` levava para a tela de agradecimento de qualquer jeito. Um depoimento que falhasse ao enviar era perdido em silêncio, com o visitante achando que tinha dado certo. Agora falha mantém o visitante na tela do texto, com mensagem, e o botão PRÓXIMO tenta de novo.
   - Validado com a API no ar: 30 MB responde 413 com o limite no corpo; 200 KB responde 201 e grava o arquivo.
3. ~~**Enxugar o Dockerfile**~~ ✅ **FEITO (2026-08-04): 1,29 GB → 879 MB.** Três mudanças, medidas com build real: estágio `prod-deps` separado com `npm ci --omit=dev`; `rm -rf .next/cache` após o build; e remoção de `@next/swc-linux-x64-gnu`. Imagem validada subindo contra o Postgres — migrations aplicam e as 6 rotas principais respondem 200, sem erro no log.
   - **A estimativa de 250–350 MB era inalcançável** e vale corrigir o raciocínio: partia da ideia de que o peso era devDependency, mas o `node_modules` de produção sozinho tem 510 MB, dos quais **420 MB são o próprio Next** (`@next/swc` + `next/dist/compiled`). Cortar dev deps rendeu bem menos que o esperado.
   - **O maior ganho isolado foi o binário SWC duplicado:** o npm instalava as variantes glibc **e** musl do `@next/swc-linux-x64` (124 MB cada) por não decidir a libc sozinho. A base é Alpine, então a glibc nunca era carregada — 124 MB de peso morto. Se a imagem base deixar de ser Alpine, a linha que remove precisa sair junto.
   - **`tsx` foi movido de devDependencies para dependencies** — é dependência de produção de fato, já que `npm run start` executa `server.ts` e as migrations direto em TypeScript. Sem isso o `--omit=dev` gera uma imagem que builda e quebra no boot.
   - **Próximo corte disponível:** `public/` são 57 MB dentro da imagem (42 MB de vídeo da Sala 1 + 14 MB de imagem). Sai de graça junto com a melhoria 1 desta lista — servindo estáticos pelo Caddy a partir de um volume, em vez de embutir na imagem.

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
| ~~9~~ | ~~**Sala 6:** ícones, prints do protótipo e imagens das cartas~~ | ✅ **RESOLVIDA (2026-08-24):** tudo entregue e a sala implementada a partir do PDF. |
| 10 | **Sala 6: são 2 dificuldades ou 3?** O protótipo só define FÁCIL e DIFÍCIL | O pedido falava em 3 níveis. Foi implementado o que o PDF mostra. Ver seção Sala 6. |
| 12 | **Sala 6:** o ranking acumula desde a inauguração ou zera periodicamente? | Sem zeragem, em alguns meses o topo fica inalcançável e o placar perde graça para o visitante novo. |
| ~~13~~ | ~~O teclado nativo do Windows abre sozinho em Chromium kiosk?~~ | ✅ **DEIXOU DE IMPORTAR (2026-08-24):** o teclado embutido foi restaurado e ligado na Escada e na Sala 6, com `inputMode="none"` nos campos. Não se depende mais do SO. Falta só validar o acerto do toque no monitor do museu. |
| 11 | **Sala 6 entra no orçamento como aditivo?** | Escopo novo depois do orçamento fechado (~14–20h). Precisa ser acertado com a empresa. |

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
| **Total (escopo do orçamento fechado)** | **~116h** |

**Escopo adicionado depois do orçamento fechado — não coberto pelos R$ 4.500:**

| Entrega | Horas |
|---|---|
| Sala 6 (jogo da memória + ranking) | 14–20h |

A Sala 6 entrou no pedido em **2026-08-24**, mais de um mês depois do orçamento assinado. Aos ~R$ 39/h do próprio orçamento, isso equivale a **R$ 550 – R$ 780**. Decidir com a empresa se vira aditivo, se substitui alguma outra entrega, ou se é absorvido — mas registrar a decisão, e não deixar passar por omissão. Ver dúvida em aberto #11.

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

**⚠️ Situação real em 2026-08-24:** o cronograma acima está estourado. Escada, Sala 7 e Admin estão prontos; a Sala 1 está funcional só em teste local; a **Sala 8 não tem fluxo implementado** (só a POC de voz) e está travada esperando o roteiro; a **Sala 6 acaba de entrar no escopo** e está travada esperando os assets; e **nada foi testado no hardware físico nem foi feito deploy na VPS**. Com a inauguração em setembro, o caminho crítico é: (1) cobrar o roteiro da Sala 8 e os assets da Sala 6, que são bloqueios externos e por isso precisam ser cobrados primeiro; (2) deploy na VPS; (3) validação no hardware do museu.

---

## Notas Técnicas

- **MadMapper:** controlado por **OSC sobre UDP**, endereços tipo `/presets/Cue 1`, porta configurável nas preferências, com OSC Query para listar os endereços. É usado pela **Sala 1** através do agente local em `apps/agente-madmapper/` — ver seção "Integração MadMapper (Sala 1)".
- **Docker Compose:** 3 serviços — `web` (Next.js + Socket.IO), `db` (Postgres), `caddy` (reverse proxy/TLS). Mesma stack sobe em VPS ou localmente.
- **Chromium kiosk da TV precisa da flag `--autoplay-policy=no-user-gesture-required`** — a TV troca de vídeo sozinha (via WebSocket, sem clique/touch), e navegadores bloqueiam autoplay com som sem essa flag ou uma interação prévia do usuário. Sem ela, o vídeo troca mas não toca.
- **AnyDesk:** instalado em cada PC para acesso remoto de Gabriel em caso de problema físico no dispositivo
- **LGPD:** com a mudança para VPS, fotos e vídeos dos visitantes (Escada) passam a trafegar e ficar armazenados no servidor central — revisar política de privacidade/termo de uso de imagem considerando esse armazenamento remoto (antes seria só local)
- **Sala 8 exige Google Chrome real, não Chromium puro.** O reconhecimento de voz (`SpeechRecognition`/Web Speech API) depende da chave de API do Google embutida só no Chrome oficial — confirmado que trava sem erro em Chromium puro e no Brave. Ver seção Sala 8 para detalhes e o protótipo em `/sala8/teste-voz`.
- **HTTPS é obrigatório para a webcam da Escada.** `getUserMedia` (captura de câmera no navegador) só funciona em "contexto seguro" — HTTPS ou `localhost`. Em produção na VPS, isso significa que precisa de um domínio público real apontando pro IP da VPS, definido em `.env` (`DOMAIN=...`, ver `.env.example`) — o Caddy emite certificado Let's Encrypt automaticamente para esse domínio (`Caddyfile`). Para testar a Escada numa rede local sem domínio público (ex: mini PC + tablet na mesma rede do museu antes de ter DNS configurado), usar `docker compose -f docker-compose.yml -f docker-compose.local-tls.yml up -d`, que sobe o Caddy com certificado autoassinado (`Caddyfile.local` + `tls internal`) — os dispositivos vão precisar confiar nesse certificado manualmente uma vez (aviso de "conexão não segura" no Chromium, aceitar/prosseguir) já que não é validado por uma CA pública.
