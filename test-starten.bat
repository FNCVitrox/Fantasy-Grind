@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Fantasy Grind - Test Console
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-starten.ps1"
exit /b %ERRORLEVEL%
