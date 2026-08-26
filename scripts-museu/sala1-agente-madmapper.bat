@echo off
rem ---------------------------------------------------------------------------
rem SALA 1 - Agente MadMapper
rem
rem Traduz o estado da sala em comandos OSC para o MadMapper. Roda no MESMO PC
rem do MadMapper. Sem ele, o tablet e a TV funcionam mas a maquete nao muda.
rem
rem O loop e proposital: se o agente cair as 9h da manha, sem ele a projecao
rem ficaria morta o dia inteiro sem ninguem perceber.
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"
title Agente MadMapper - Sala 1

cd /d %RAIZ%\agente-madmapper

:loop
echo [%date% %time%] iniciando agente >> "%LOGS%\agente-madmapper.log"
call npm start >> "%LOGS%\agente-madmapper.log" 2>&1
echo [%date% %time%] agente encerrou (codigo %errorlevel%), reiniciando em 10s >> "%LOGS%\agente-madmapper.log"
timeout /t 10 /nobreak > nul
goto loop
