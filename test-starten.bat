@echo off
setlocal EnableExtensions
title Fantasy Grind - Qualitaetscheck
color 0B

for /F "tokens=1 delims=#" %%A in ('"prompt #$E# & echo on & for %%B in (1) do rem"') do set "ESC=%%A"
set "C_RESET=%ESC%[0m"
set "C_DIM=%ESC%[90m"
set "C_GOLD=%ESC%[93m"
set "C_CYAN=%ESC%[96m"
set "C_GREEN=%ESC%[92m"
set "C_RED=%ESC%[91m"

cd /d "%~dp0"
cls

echo %C_GOLD%========================================================================%C_RESET%
echo %C_GOLD%  FANTASY GRIND%C_RESET% %C_CYAN%- QUALITAETSCHECK%C_RESET%
echo %C_GOLD%========================================================================%C_RESET%
echo.
echo %C_DIM%Projekt:%C_RESET% %CD%
echo %C_DIM%Aufgabe : Syntaxchecks + Smoke-Test-Suite%C_RESET%
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo %C_RED%[FEHLER]%C_RESET% npm.cmd wurde nicht gefunden.
  echo Installiere Node.js oder oeffne dieses Projekt in einer Node-Umgebung.
  echo.
  pause
  exit /b 1
)

if not exist package.json (
  echo %C_RED%[FEHLER]%C_RESET% package.json wurde nicht gefunden.
  echo Starte diese Datei bitte aus dem Fantasy-Grind-Projektordner.
  echo.
  pause
  exit /b 1
)

echo %C_CYAN%[1/3]%C_RESET% Umgebung gefunden
echo %C_CYAN%[2/3]%C_RESET% Testlauf startet
echo %C_DIM%------------------------------------------------------------------------%C_RESET%
echo.

call npm.cmd test --silent
set "TEST_EXIT=%ERRORLEVEL%"

echo.
echo %C_DIM%------------------------------------------------------------------------%C_RESET%
if "%TEST_EXIT%"=="0" (
  echo %C_GREEN%[3/3] ALLE TESTS BESTANDEN%C_RESET%
  echo.
  echo %C_GOLD%        ___  ___  ___  ___  ___  ___  ___%C_RESET%
  echo %C_GOLD%       /___\/___\/___\/___\/___\/___\/___\%C_RESET%
  echo %C_GREEN%       Fantasy Grind ist bereit fuer den naechsten Push.%C_RESET%
) else (
  echo %C_RED%[3/3] TESTS FEHLGESCHLAGEN%C_RESET%
  echo.
  echo %C_RED%       Bitte die Fehlermeldung oben anschauen und erst danach pushen.%C_RESET%
)
echo %C_DIM%------------------------------------------------------------------------%C_RESET%
echo.
pause
exit /b %TEST_EXIT%
