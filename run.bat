@echo off
echo Starting HandSpace...

:: 1. Try starting with npx http-server (Node.js)
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js detected. Starting with http-server...
    :: -y: yes to install if needed
    :: -o: open browser
    :: -c-1: disable caching
    call npx -y http-server . -o -c-1
    goto :EOF
)

:: 2. Fallback to Python if Node is missing
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js not found. Python detected. Starting with python...
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto :EOF
)

:: 3. If neither found
echo Error: Neither Node.js nor Python was found.
echo Please install Node.js (recommended) or Python to run this project.
pause
