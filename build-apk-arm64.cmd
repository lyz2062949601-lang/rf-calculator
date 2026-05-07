@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0scripts\env-china.cmd"
rem 若未设置 JAVA_HOME，自动使用 Microsoft OpenJDK 21（winget 默认安装路径）
if not defined JAVA_HOME (
  for /d %%J in ("C:\Program Files\Microsoft\jdk-21*") do (
    set "JAVA_HOME=%%~fJ"
    goto :jdk_done
  )
)
:jdk_done
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
set "PATH=C:\Program Files\nodejs;%PATH%"
where npm >nul 2>nul
if not %errorlevel%==0 (
  echo 未找到 npm，请先安装 Node.js LTS: https://nodejs.org
  exit /b 1
)
call npm install
if not %errorlevel%==0 exit /b 1
if not exist android\ (
  echo 首次生成 android 工程...
  call npx cap add android
  if not %errorlevel%==0 exit /b 1
)
call npx cap sync
if not %errorlevel%==0 exit /b 1
call npm run android:patch
echo.
echo [JDK] Android Gradle Plugin 8.2 需要 JDK 11+ ^(推荐 17^)。当前 JAVA_HOME 与 java -version:
if defined JAVA_HOME (echo JAVA_HOME=%JAVA_HOME%) else (echo JAVA_HOME 未设置，Gradle 可能使用系统默认 Java。)
java -version 2>&1
java -version 2>&1 | findstr /C:"1.8.0" >nul
if %errorlevel%==0 (
  echo [错误] 检测到 Java 8。请安装 JDK 17 或 21，设置 JAVA_HOME 与 PATH 后重试。
  exit /b 1
)
echo 正在编译 ARM64-v8a 调试 APK ^(Gradle 使用腾讯云分发 + 阿里云 Maven^)...
cd android
call gradlew.bat assembleDebug
set ERR=%errorlevel%
cd ..
if not %ERR%==0 exit /b %ERR%
if not exist dist mkdir dist
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "dist\RF-Calculator-PA-v1.0.0-arm64-debug.apk" >nul
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "dist\RF-Calculator-PA-arm64-debug.apk" >nul
echo.
echo Gradle 输出: android\app\build\outputs\apk\debug\app-debug.apk
echo 发布副本: dist\RF-Calculator-PA-v1.0.0-arm64-debug.apk ^(及 RF-Calculator-PA-arm64-debug.apk 同包^)
exit /b 0
