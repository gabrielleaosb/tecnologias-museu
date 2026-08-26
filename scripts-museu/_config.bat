@echo off
rem ---------------------------------------------------------------------------
rem Configuracao compartilhada por todos os .bat do museu.
rem EDITE ESTE ARQUIVO E MAIS NENHUM OUTRO.
rem ---------------------------------------------------------------------------

rem Endereco publico do sistema. Precisa ser https:// por causa da webcam da
rem Escada e do microfone da Sala 8 (navegador so libera em contexto seguro).
set SISTEMA=https://SEU-DOMINIO.com.br

rem Onde ficam os arquivos e os logs neste PC.
set RAIZ=C:\museu
set LOGS=%RAIZ%\logs
set PERFIS=%RAIZ%\perfis

rem Navegadores. A Sala 8 EXIGE o Google Chrome oficial (ver AUTOMACAO-PCS.md).
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"

if not exist "%LOGS%" mkdir "%LOGS%"
if not exist "%PERFIS%" mkdir "%PERFIS%"
