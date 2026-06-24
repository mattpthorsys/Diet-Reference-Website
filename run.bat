@echo off
setlocal enabledelayedexpansion
title Successor Health Hub Starter

echo ======================================================
echo          Successor Health Hub Starter Script
echo ======================================================
echo.

:: Check for Node.js / npx
where npx >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] Node.js/npx detected.
    echo Launching http-server on port 8000...
    start "" "http://localhost:8000"
    npx http-server -p 8000 -c-1
    goto end
)

:: Check for Python
where python >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] Python detected.
    echo Launching Python HTTP server on port 8000...
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto end
)

:: Check for py (Python launcher)
where py >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] Python Launcher (py) detected.
    echo Launching Python HTTP server on port 8000...
    start "" "http://localhost:8000"
    py -m http.server 8000
    goto end
)

:: Fallback: Direct File Open
echo [!] No Node.js or Python environments found.
echo Opening index.html directly in the default browser...
echo Note: Some browser features might be restricted when run from a local file.
echo.
start "" "index.html"

:end
pause
