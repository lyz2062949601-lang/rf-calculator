@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0scripts\env-china.cmd"
set "PATH=C:\Program Files\nodejs;%PATH%"
where npm >nul 2>nul
if not %errorlevel%==0 (
  echo 未找到 npm，请先安装 Node.js LTS。
  exit /b 1
)
echo === 1/2 Windows x64 便携 exe ^(国内镜像^) ===
call npm install
if not %errorlevel%==0 exit /b 1
call npm run dist:win
if not %errorlevel%==0 exit /b 1
if exist dist\win-unpacked rmdir /s /q dist\win-unpacked
if exist dist\web-v3 rmdir /s /q dist\web-v3
mkdir dist\web-v3
xcopy /E /I /Y "%~dp0www\*" "%~dp0dist\web-v3\" >nul
echo.
echo === 2/2 Android ARM64 APK ^(腾讯云 Gradle + 阿里云 Maven^) ===
call build-apk-arm64.cmd
if not %errorlevel%==0 exit /b %errorlevel%
echo.
echo 全部产物: dist\
dir /b dist\RF-Calculator-PA-*.exe dist\*.apk dist\web-v3\index.html 2>nul
exit /b 0
