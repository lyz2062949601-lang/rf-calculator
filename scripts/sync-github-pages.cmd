@echo off
cd /d "%~dp0.."
if not exist docs mkdir docs
echo Sync www to docs for GitHub Pages...
xcopy /E /I /Y "www\*" "docs\"
echo Done. Commit docs folder. GitHub Pages: Settings - Pages - Branch main - Folder docs
