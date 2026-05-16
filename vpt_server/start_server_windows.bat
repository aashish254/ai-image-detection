@echo off
REM ============================================
REM VPT Server - Windows Startup Script
REM ============================================
REM This script starts the Python inference server
REM on Windows. The local classifier will work on
REM CPU, while VPT model requires Linux GPU.
REM ============================================

echo ============================================
echo   AI Image Detection - Python Server
echo ============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

echo [1/3] Checking Python dependencies...

REM Install/upgrade core dependencies (Windows-compatible only)
pip install torch torchvision transformers pillow fastapi "uvicorn[standard]" python-multipart peft accelerate --quiet 2>nul

if errorlevel 1 (
    echo WARNING: Some dependencies failed to install.
    echo Trying with --no-deps flag...
    pip install transformers pillow fastapi uvicorn python-multipart --quiet --no-deps 2>nul
)

echo [2/3] Dependencies ready.
echo [3/3] Starting server on port 8100...
echo.
echo ============================================
echo   Server: http://localhost:8100
echo   Health: http://localhost:8100/health
echo   Classifier: ENABLED (CPU)
echo   VPT Model: DEMO MODE (requires Linux GPU)
echo ============================================
echo.

cd /d "%~dp0"
python server.py

pause
