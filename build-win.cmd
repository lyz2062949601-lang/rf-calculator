@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0scripts\env-china.cmd"
set "PATH=C:\Program Files\nodejs;%PATH%"
where npm >nul 2>nul
if not %errorlevel%==0 (
  echo 未找到 npm。请先安装 Node.js ^(https://nodejs.org^)
  exit /b 1
)
echo [国内镜像] npm=%NPM_CONFIG_REGISTRY%
echo [国内镜像] electron=%ELECTRON_MIRROR%
echo Installing dependencies...
call npm install
if not %errorlevel%==0 exit /b 1
echo Building Windows x64 portable exe...
call npm run dist:win
if not %errorlevel%==0 exit /b 1
if exist dist\win-unpacked rmdir /s /q dist\win-unpacked
if exist dist\web-v3 rmdir /s /q dist\web-v3
mkdir dist\web-v3
xcopy /E /I /Y "%~dp0www\*" "%~dp0dist\web-v3\" >nul
echo.
echo 完成。发布目录 dist\
echo   便携 exe、静态网页 web-v3\
dir /b dist\RF-Calculator-PA-*.exe 2>nul
dir /b dist\web-v3\index.html 2>nul
exit /b 0
