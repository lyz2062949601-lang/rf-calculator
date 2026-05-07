@echo off
cd /d "%~dp0www"
echo Serving from www at http://localhost:8080
echo Press Ctrl+C to stop.
where py >nul 2>nul && py -m http.server 8080 && goto :eof
where python >nul 2>nul && python -m http.server 8080 && goto :eof
echo Python not found. Install Python or open www\index.html in a browser.
