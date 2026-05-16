#!/bin/bash
# ============================================
# VPT Server - macOS Startup Script
# ============================================
# This script starts the Python inference server
# on macOS. The local classifier (Organika/sdxl-detector)
# works on CPU. The VPT model requires a CUDA GPU
# and will run in DEMO mode on Mac.
# ============================================

echo "============================================"
echo "  AI Image Detection - Python Server (macOS)"
echo "============================================"
echo ""

# Get the directory this script is in
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH."
    echo "Please install Python 3.9+ from https://python.org"
    exit 1
fi

echo "[1/3] Checking Python environment..."

# Activate venv if it exists
if [ -f "$PROJECT_ROOT/.venv/bin/activate" ]; then
    echo "  Activating virtual environment..."
    source "$PROJECT_ROOT/.venv/bin/activate"
else
    echo "  WARNING: No virtual environment found at $PROJECT_ROOT/.venv"
    echo "  Run: python3 -m venv $PROJECT_ROOT/.venv"
    echo "  Then: source $PROJECT_ROOT/.venv/bin/activate && pip install -r $SCRIPT_DIR/requirements.txt"
fi

echo "[2/3] Dependencies ready."
echo "[3/3] Starting server on port 8100..."
echo ""
echo "============================================"
echo "  Server: http://localhost:8100"
echo "  Health: http://localhost:8100/health"
echo "  Classifier: ENABLED (CPU)"
echo "  VPT Model: DEMO MODE (requires NVIDIA GPU)"
echo "============================================"
echo ""

cd "$SCRIPT_DIR"
python3 server.py
