# Instalação no Museu — guia de campo

**Para o Gabriel, na primeira viagem a Piranhas.** O que fazer, em que ordem, e como testar cada coisa.

A regra que organiza tudo: **faça primeiro o que só pode ser feito lá.** Configuração de software você resolve de casa por AnyDesk; alinhar um projetor em cima de uma maquete, não. Se o tempo acabar, o que tem que estar pronto é o físico.

Documento irmão: **`AUTOMACAO-PCS.md`** — entregue àquele que for automatizar os PCs (pode ser outra pessoa).

---

## Antes de viajar

### Leve

- [ ] Notebook com o projeto clonado e rodando localmente
- [ ] **Cabo de rede** e adaptador USB-Ethernet — não confie no Wi-Fi do museu para instalar
- [ ] Pendrive com: Node.js, Google Chrome, AnyDesk, e uma cópia de `scripts-museu/`
- [ ] Os vídeos da Sala 1 e os vídeos da maquete, em disco (não conte com baixar lá)
- [ ] Adaptadores de vídeo: HDMI, DisplayPort, e conversores. O projetor e a TV do museu podem ter conector que você não previu.
- [ ] Mouse e teclado USB — as telas são touch, mas você vai precisar deles para configurar

### Confirme por mensagem, antes de ir

- [ ] **O domínio já está apontando para a VPS?** Sem ele não há HTTPS; sem HTTPS a Escada e a Sala 8 não funcionam. **Este é o bloqueio nº 1** — resolva antes de comprar passagem.
- [ ] O deploy na VPS está feito e o sistema responde no domínio?
- [ ] Os PCs foram comprados e estão no museu?
- [ ] A licença do MadMapper está ativada, e em qual máquina?
- [ ] O roteiro da Sala 8 chegou? (Se não, a Sala 8 não é instalável nesta viagem — planeje sem ela.)

### Deixe pronto de casa

- [ ] Sistema no ar e testado pelo domínio público, do seu navegador
- [ ] `npm run verificar-real` funcionando contra o MadMapper do seu PC
- [ ] `scripts-museu/_config.bat` já com o domínio real preenchido

---

## Ordem de trabalho no museu

### Dia 1, primeira hora — infraestrutura

Antes de qualquer sala. Se algo aqui estiver errado, nada mais funciona e é melhor descobrir na primeira hora.

1. **Rede.** Conecte um PC no cabo e abra o sistema pelo domínio público. Se abrir, a internet do museu e o servidor estão bons.
2. **Meça a internet.** Teste de velocidade e, principalmente, estabilidade — deixe um `ping` rodando alguns minutos. A Escada envia vídeo e a Sala 8 depende de serviço em nuvem.
3. **Tomadas e no-breaks.** Confira que cada PC tem alimentação estável. Queda de energia com o PC ligado corrompe sistema de arquivos com o tempo.
4. **AnyDesk em todas as máquinas**, com senha de acesso não supervisionado, e **anote os IDs**. Faça isso cedo: é o que permite consertar tudo depois, de casa.

### Dia 1 — Sala 1 (a mais demorada, comece por ela)

A Sala 1 é a única que exige alinhamento físico. Reserve o maior bloco de tempo para ela.

**1. Ligue as três saídas de vídeo.** O PC tem tela touch, TV e projetor. Confirme no Windows que os três monitores aparecem, e **anote a coordenada X de cada um** (Configurações → Sistema → Vídeo) — você vai precisar para o `sala1-telas.bat`.

**2. Posicione o projetor.** Fixe-o de verdade antes de mapear. Se ele se mexer depois, todo o mapeamento se perde e o trabalho é refeito do zero. Este é o motivo de o alinhamento ser a última coisa a fazer e a primeira a proteger.

**3. Mapeie a maquete no MadMapper.** Crie uma superfície por face da maquete que vai receber projeção. Nomeie sem acento e sem espaço.

**4. Carregue os vídeos com os nomes certos.** Um por tema. Os nomes das mídias são o que o `config.json` referencia.

**5. Preencha o `config.json` do agente** com os nomes reais das superfícies e mídias. Modelo em `apps/agente-madmapper/config.example.json`.

**6. Teste na ordem, de baixo para cima:**

```bat
cd C:\museu\agente-madmapper
npm run verificar-real
```

Isso confirma que o OSC chega ao MadMapper. **Se falhar aqui, não adianta testar o resto** — a saída do comando diz o que verificar.

Depois:

```bat
npm start
```

E toque num tema na tela touch. A maquete tem que mudar junto com a TV.

**7. Só então ajuste o alinhamento fino** das superfícies em cima da maquete, com os vídeos reais tocando.

### Dia 1 ou 2 — demais salas

Estas são muito mais rápidas: instalar Chrome, copiar os `.bat`, configurar o Windows (ver `AUTOMACAO-PCS.md` Parte 1) e testar.

| Sala | O que testar especificamente |
|---|---|
| **Escada** | Webcam abre; grava foto **e** vídeo; o depoimento aparece na Sala 7 em segundos; teclado on-screen funciona no touch do museu |
| **Sala 7** | Recebe em tempo real o que a Escada envia |
| **Sala 6** | Toque duplo rápido em duas cartas não bugga; ranking grava; teclado on-screen ok |
| **Sala 8** | Só se o roteiro tiver chegado. Testar **com o ruído real do salão**, não em silêncio |

---

## Testes que só podem ser feitos lá

Estes são o motivo da viagem. Tudo o mais é ajustável remotamente.

### Alinhamento da projeção sobre a maquete
Não tem simulação possível. Reserve tempo e faça com a iluminação **que o museu vai ter aberto** — luz ambiente muda completamente a percepção do brilho.

### Precisão do reconhecimento de voz com ruído
A Sala 8 até hoje só foi testada em silêncio. **Com visitantes conversando no salão, a taxa de acerto pode cair muito.** Teste com o ambiente barulhento de propósito — peça para pessoas conversarem perto. Se a precisão for inaceitável, o plano B (motor offline com vocabulário restrito) volta à mesa, e é melhor descobrir isso lá do que na inauguração.

Lembre: os números são pedidos como **"número um"**, não "um" solto.

### Acerto do toque nas telas
O teclado on-screen e os botões foram desenhados em tela de desktop. Num monitor touch de 32", com dedo em vez de mouse, alvos podem ficar difíceis. Teste com **as mãos de outra pessoa**, não só as suas — você sabe onde clicar, o visitante não.

### Autoplay e áudio
Confirme que a TV toca com som ao trocar de vídeo sozinha. É o sintoma clássico da flag `--autoplay-policy` faltando.

### Comportamento com internet instável
Desconecte o cabo de rede por 30 segundos e reconecte, em cada sala. Tudo tem que voltar sozinho, sem ninguém tocar. Faça esse teste **em todas** as salas.

---

## Antes de ir embora

- [ ] Reiniciar **cada** PC pelo botão e cronometrar até a tela final, sem tocar em nada
- [ ] Deixar todas as salas rodando por 1 hora e voltar para conferir se ainda estão de pé
- [ ] IDs e senhas do AnyDesk anotados e testados **de fora da rede do museu** (use dados do celular)
- [ ] Uma cópia do projeto do MadMapper salva em outro lugar além do PC da Sala 1
- [ ] Entregar ao museu o documento de operação básica: como ligar, como desligar, o que fazer se uma tela travar
- [ ] Confirmar com o museu **quem** é a pessoa de contato para operação diária

### O documento de uma página para o museu

Deixe impresso, ao lado de cada PC:

> **Se a tela travar:** desligue o computador pelo botão, espere 10 segundos, ligue de novo. Ele volta sozinho na tela certa em cerca de 2 minutos. Não é preciso mexer em mais nada.
>
> **Se não voltar:** ligue para Gabriel — ele consegue acessar de longe e resolver.

---

## Diagnóstico rápido em campo

| Sintoma | Olhe primeiro |
|---|---|
| Tela em branco ou erro de conexão | O domínio responde? A internet do museu caiu? |
| Câmera da Escada não abre | O endereço está em `https://`? A permissão foi concedida naquele perfil? |
| Sala 8 não reage à voz | É o **Google Chrome oficial**? A permissão de microfone foi concedida? |
| TV troca de vídeo mas fica muda/parada | Falta `--autoplay-policy=no-user-gesture-required` |
| As duas telas da Sala 1 no mesmo monitor | `--user-data-dir` repetido entre as duas janelas |
| Maquete não muda ao escolher tema | `npm run verificar-real`. Se passar, o problema está nos nomes do `config.json`, não no transporte. |
| Sala 1 travada numa tela e não sai | Há um watchdog no servidor que devolve ao standby (60s em `encerrando`, 10min em `tema`). Se passou disso, o servidor caiu. |
| Depoimento não chega na Sala 7 | Servidor de pé? Ver logs da VPS. |

---

## O que fica pendente depois desta viagem

Anote aqui o que não deu para fechar, para não se perder até a próxima:

- [ ] ...
