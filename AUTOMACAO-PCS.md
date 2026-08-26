# Automação dos PCs — Museu do Sertão de Piranhas

**Para quem vai configurar os computadores do museu para ligarem sozinhos no sistema certo.**

Este documento é auto-contido: não é preciso entender como o sistema funciona por dentro para executá-lo. Onde uma decisão exigir conhecimento do sistema, está marcado com **⚠ FALAR COM O GABRIEL**.

Contato do desenvolvedor: Gabriel Leão.

---

## O que é o sistema, em um parágrafo

São telas interativas de museu. Cada tela é uma **página web em modo quiosque** — navegador em tela cheia, sem barra de endereço, sem como sair. Todas apontam para o mesmo servidor na internet. Uma sala (a Sala 1) tem também um programa de projeção, o **MadMapper**, e um pequeno programa auxiliar que conversa com ele.

Do seu ponto de vista, automatizar isso é: **fazer o PC ligar, entrar no Windows sozinho e abrir os programas certos, em tela cheia, sem nenhuma interação humana.**

**Nenhum PC do museu roda servidor, banco de dados ou Docker.** Tudo isso fica num servidor na internet. Os PCs daqui só abrem navegador.

A única exceção é o PC da Sala 1, que roda também o **MadMapper** e um pequeno programa auxiliar em Node — e ele não pode ficar no servidor por um motivo técnico simples: o MadMapper é comandado por um protocolo (UDP) que **navegador nenhum consegue enviar**, e só aceita comandos de dentro da própria rede. Esse programa é a ponte entre o servidor e o MadMapper, e por isso precisa estar na mesma máquina que ele.

---

## Regra de ouro

O museu abre, alguém liga o botão do PC, e **nada mais é feito por mão humana**. Se em algum momento a instalação exigir clicar em "OK", digitar senha ou fechar um aviso, ela está errada e vai falhar num dia em que você não estiver lá.

---

## Parte 1 — Preparação do Windows (todos os PCs)

Estes cinco itens valem para **todas** as máquinas. São a causa da maioria absoluta das falhas em totem de museu.

### 1.1 Login automático

Se o PC parar numa tela de senha, **nada** do que você configurar depois vai rodar. Este é o erro número um.

- `netplwiz` → desmarcar "Os usuários devem digitar um nome de usuário e senha" → aplicar → informar a senha da conta.
- Se a opção não aparecer (comum no Windows 11), habilitar antes em
  `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device` → `DevicePasswordLessBuildVersion` = `0`

**Teste:** reiniciar e cronometrar. Tem que chegar na área de trabalho sem tocar em nada.

### 1.2 Nada de suspender, hibernar ou desligar a tela

O museu fica ligado 8 horas por dia e várias telas ficam sem ninguém tocar nelas por horas.

- Configurações → Sistema → Energia → **Tela: nunca**, **Suspensão: nunca**
- Plano de energia: **Alto desempenho**
- Desativar a **suspensão seletiva de USB** (Opções de energia → Alterar configurações do plano → Configurações avançadas). Isso derruba webcam e tela touch depois de horas ociosas, e o sintoma é "parou de funcionar sozinho" — o pior de todos para diagnosticar.

### 1.3 Windows Update não pode reiniciar sozinho

Um reinício no meio da visitação derruba a sala.

- Configurações → Windows Update → **Horário ativo** cobrindo todo o horário do museu.
- Pausar atualizações pelo período máximo, e combinar com o museu uma janela mensal para atualizar de propósito.

### 1.4 Sem protetor de tela, sem tela de bloqueio

- Protetor de tela: **Nenhum**
- Bloqueio automático: desativado

### 1.5 Sem notificação e sem primeira execução

- Ativar **Assistente de Foco / Não Perturbe** permanentemente.
- Abrir o Google Chrome **uma vez à mão em cada perfil** e dispensar tudo que ele perguntar: login, navegador padrão, importar dados. Ver Parte 4.

---

## Parte 2 — O que roda em cada PC

Cada sala tem sua função. **Confirme esta tabela com o Gabriel antes de começar** — o número de máquinas pode ter mudado.

| Sala | O que roda | Observação |
|---|---|---|
| **Sala 1** | MadMapper + agente + **2 janelas** de navegador | O mais complexo. Ver Parte 3. |
| **Escada** | 1 janela de navegador | Usa **webcam**. Precisa de permissão. |
| **Sala 6** | 1 janela de navegador | Totem touch simples. |
| **Sala 7** | 1 janela de navegador | Só exibe, sem interação. |
| **Sala 8** | 1 janela de navegador | Usa **microfone**. **Exige Google Chrome oficial.** |

### Pré-requisitos de software

| Software | Onde | Por quê |
|---|---|---|
| **Google Chrome** (oficial) | todos os PCs | Na Sala 8 é obrigatório — ver Parte 5. Nos outros, use o mesmo por padronização. |
| **Node.js 20 ou superior** | **só no PC da Sala 1** | O agente do MadMapper é um programa Node. |
| **MadMapper** | **só no PC da Sala 1** | Licenciado. O museu fornece. |
| **AnyDesk** | todos os PCs | Manutenção remota do Gabriel. Iniciar com o Windows, com **senha de acesso não supervisionado**. |

---

## Parte 3 — Os scripts

Os arquivos `.bat` estão na pasta `scripts-museu/` do projeto. Copie a pasta para **`C:\museu\scripts`** em cada PC.

### 3.1 Editar UM arquivo só

Abra **`C:\museu\scripts\_config.bat`** e ajuste:

```bat
set SISTEMA=https://SEU-DOMINIO.com.br
```

⚠ **FALAR COM O GABRIEL** para pegar o endereço real. Ele **tem que ser `https://`** — em `http://` a webcam da Escada e o microfone da Sala 8 não funcionam, por regra do navegador, e o erro não é óbvio na tela.

Nenhum outro `.bat` precisa ser editado, **exceto** o `sala1-telas.bat` (posição dos monitores — ver 3.3).

### 3.2 Colocar no startup

Para cada PC, coloque um **atalho** do `.bat` da sala em:

```
shell:startup
```

Win+R, digite `shell:startup`, Enter — abre a pasta de inicialização do usuário.

| PC | Atalhos a colocar |
|---|---|
| Sala 1 | `sala1-agente-madmapper.bat`, `sala1-telas.bat`, **+ o projeto do MadMapper** (ver 3.4) |
| Escada | `escada-tela.bat` |
| Sala 6 | `sala6-tela.bat` |
| Sala 7 | `sala7-tela.bat` |
| Sala 8 | `sala8-tela.bat` |

### 3.3 Sala 1 — as posições dos monitores

O PC da Sala 1 tem **três saídas de vídeo**: a tela touch onde o visitante interage, a TV que toca o vídeo, e o projetor que joga imagem na maquete.

Abra `sala1-telas.bat` e ajuste os `--window-position`. O valor de X é a coordenada onde cada monitor começa no arranjo do Windows — veja em **Configurações → Sistema → Vídeo**, arrastando os monitores. Se a tela touch está à esquerda e a TV à direita, ambas com 1920 de largura, os valores que já estão no arquivo servem.

**A armadilha desta sala:** cada janela do Chrome usa um `--user-data-dir` diferente. Isso **não é opcional**. Sem perfis separados, o segundo comando não abre uma janela nova — o Chrome percebe que já existe instância rodando e abre apenas uma aba dentro da primeira janela. O resultado é as duas telas empilhadas num monitor só e nada no outro, com um sintoma que não sugere a causa em nada. Se você mexer nesse arquivo, **mantenha os `--user-data-dir` distintos**.

### 3.4 Sala 1 — o MadMapper

O MadMapper é um programa de janela, não um serviço. Use um **atalho no `shell:startup` apontando para o arquivo do projeto** (`.madmapper`), **não** para o executável. Assim o Windows abre o programa já com o projeto certo carregado, e não há risco de ele subir vazio.

⚠ **FALAR COM O GABRIEL** para saber qual é o arquivo do projeto e em que pasta ele fica.

**A ordem não importa** entre o MadMapper e o agente. Se o agente subir primeiro, ele apenas não encontra ninguém para falar naquele instante e tenta de novo no evento seguinte — isso é esperado e já está tratado no programa.

### 3.5 Instalar o agente da Sala 1

Só no PC da Sala 1:

```bat
mkdir C:\museu\agente-madmapper
rem copiar para ai o conteudo de apps/agente-madmapper do projeto
cd /d C:\museu\agente-madmapper
npm install
copy config.example.json config.json
```

⚠ **FALAR COM O GABRIEL** para preencher o `config.json` — ele contém os nomes das superfícies e dos vídeos do MadMapper, que dependem de como a maquete foi mapeada.

**Teste do agente**, com o MadMapper aberto:

```bat
npm run verificar-real
```

Se terminar com `✓ O MadMapper recebeu e aplicou o OSC do agente`, esse elo está bom. Se falhar, a própria saída diz o que verificar, em ordem.

---

## Parte 4 — Permissões de câmera e microfone

**Escada** (câmera) e **Sala 8** (microfone) precisam de permissão do navegador. Se o Chrome perguntar durante a visitação, um visitante vai ver uma caixa de diálogo que não deveria existir — e a sala não funciona até alguém clicar nela.

A permissão fica gravada **dentro do perfil** (`--user-data-dir`), então concedê-la uma vez basta, e ela sobrevive a reinícios.

Para cada uma dessas duas máquinas, **antes** de pôr no startup:

1. Rode o `.bat` da sala à mão, uma vez.
2. Saia do modo quiosque (`Alt+F4`) e abra o Chrome **com o mesmo perfil**, sem `--kiosk`:
   ```bat
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir=C:\museu\perfis\escada
   ```
3. Acesse o endereço do sistema, deixe a página pedir a permissão e clique em **Permitir**.
4. Feche. Pronto — o perfil guardou.

**Confira que ficou:** rode o `.bat` de novo e veja se a câmera ou o microfone abre sem perguntar nada.

---

## Parte 5 — A exigência da Sala 8

**A Sala 8 só funciona no Google Chrome oficial.** Não funciona em Chromium, Microsoft Edge nem Brave.

O reconhecimento de voz usa uma API do navegador que depende de uma chave de serviço do Google embutida **apenas** na build oficial do Chrome. Nos outros navegadores ele não dá erro: simplesmente **trava sem disparar evento nenhum**, e a sala parece "surda". Isso foi testado e confirmado em campo — não é suposição, e não tem contorno por configuração.

Se alguém padronizar os PCs do museu em outro navegador, a Sala 8 para de funcionar sem nenhuma mensagem de erro que explique o motivo.

---

## Parte 6 — Como saber que deu certo

Para cada PC o teste é o mesmo, e **precisa ser feito com reinício de verdade**, não só rodando o `.bat`:

1. Desligue o PC pelo botão.
2. Ligue.
3. **Não toque em nada.** Cronometre.
4. Em até ~2 minutos a tela tem que estar mostrando a página da sala, em tela cheia, sem barra de endereço e sem aviso nenhum.

Se em algum momento precisou de teclado ou mouse, a instalação não está pronta.

**Checklist final por PC:**

- [ ] Liga sozinho até a tela final, sem interação
- [ ] Tela cheia, sem barra de endereço e sem barra de notificação do Chrome
- [ ] Fica 30 minutos ligado sem apagar a tela nem suspender
- [ ] Ao desconectar e reconectar a rede, a tela volta sozinha
- [ ] AnyDesk instalado, iniciando com o Windows, com senha de acesso não supervisionado
- [ ] **Sala 1:** as duas janelas em monitores diferentes, e a maquete reage ao tocar num tema
- [ ] **Escada:** a câmera abre sem pedir permissão
- [ ] **Sala 8:** o microfone ativa sem pedir permissão

---

## Parte 7 — Onde estão os logs

O agente da Sala 1 grava em **`C:\museu\logs\agente-madmapper.log`**, com data e hora. É o primeiro lugar a olhar quando a projeção da maquete não muda.

Deixe essa pasta acessível — é por ela que o Gabriel diagnostica remotamente, via AnyDesk, sem precisar viajar.

---

## Parte 8 — O que NÃO fazer

- **Não** use o mesmo `--user-data-dir` em duas janelas do Chrome (ver 3.3).
- **Não** troque o Chrome por outro navegador na Sala 8 (ver Parte 5).
- **Não** deixe o sistema em `http://` — quebra câmera e microfone (ver 3.1).
- **Não** remova o `--autoplay-policy=no-user-gesture-required` da TV da Sala 1 nem da Sala 7. Essas telas trocam de vídeo sozinhas, sem ninguém tocar nelas, e sem essa opção o vídeo troca mas fica mudo e parado.
- **Não** junte tudo num `.bat` só. Separados, cada coisa falha de forma visível e independente; juntos, você não descobre qual quebrou.
- **Não** ative atualização automática do Chrome com reinício silencioso durante o horário do museu.

---

## Dúvidas em aberto para alinhar com o Gabriel

1. Endereço real do sistema (`SISTEMA` no `_config.bat`)
2. Quantos PCs, e qual sala em cada um
3. Arranjo dos monitores da Sala 1 — qual saída é a tela touch, qual é a TV, qual é o projetor
4. Caminho do arquivo de projeto do MadMapper
5. Conteúdo do `config.json` do agente
6. Quem tem a licença do MadMapper e em qual máquina ela está ativada
