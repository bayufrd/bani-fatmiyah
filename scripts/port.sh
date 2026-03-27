#!/bin/bash

# Simple Port Checker - Minimal version
# Usage: ./port.sh [PORT]

if [ -z "$1" ]; then
    echo "Usage: $0 <PORT>"
    echo ""
    echo "Examples:"
    echo "  $0 3000"
    echo "  $0 8080"
    exit 1
fi

PORT=$1

echo "Checking port $PORT..."

# Try ss first (faster, available in most Linux)
if command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":$PORT "; then
        echo "✗ Port $PORT is BUSY (already in use)"
        ss -tuln | grep ":$PORT "
        exit 1
    else
        echo "✓ Port $PORT is AVAILABLE"
        exit 0
    fi
fi

# Fallback to netstat
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":$PORT "; then
        echo "✗ Port $PORT is BUSY (already in use)"
        netstat -tuln | grep ":$PORT "
        exit 1
    else
        echo "✓ Port $PORT is AVAILABLE"
        exit 0
    fi
fi

echo "✗ Cannot check port. Install ss or netstat."
exit 1
