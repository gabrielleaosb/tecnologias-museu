@echo off
rem ---------------------------------------------------------------------------
rem SALA 8 - Assistente virtual por VOZ
rem
rem EXIGE GOOGLE CHROME OFICIAL. Nao funciona em Chromium, Edge ou Brave:
rem o reconhecimento de voz (Web Speech API) depende de uma chave de API do
rem Google embutida so no Chrome oficial. Nos outros ele trava sem erro nenhum,
rem sem disparar evento algum - parece que a sala esta "surda".
rem
rem A permissao de MICROFONE precisa ser concedida UMA VEZ neste perfil, a mao,
rem antes de virar kiosk. Ver AUTOMACAO-PCS.md, secao "Permissoes".
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\sala8" ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/sala8
