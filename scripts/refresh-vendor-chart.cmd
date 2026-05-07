@echo off
chcp 65001 >nul
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -Command "New-Item -ItemType Directory -Force -Path 'www\vendor' | Out-Null; Invoke-WebRequest -Uri 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js' -OutFile 'www\vendor\chart.umd.min.js' -UseBasicParsing"
echo Chart.js 已写入 www\vendor\chart.umd.min.js
exit /b 0
