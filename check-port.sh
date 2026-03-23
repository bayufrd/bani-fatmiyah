#!/bin/bash

# Script untuk mengecek port yang tersedia di Linux

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "Port Checker untuk Linux"
echo "================================"
echo ""

# Function untuk check satu port
check_port() {
    local port=$1
    
    # Method 1: Menggunakan netstat (lebih universal)
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${RED}✗${NC} Port $port: ${RED}SUDAH DIGUNAKAN${NC}"
        # Tampilkan proses yang menggunakan port
        echo "  Proses yang menggunakan:"
        netstat -tuln 2>/dev/null | grep ":$port " | awk '{print "  - " $0}'
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $port: ${GREEN}TERSEDIA${NC}"
        return 0
    fi
}

# Function menggunakan ss (lebih baru, biasanya lebih cepat)
check_port_ss() {
    local port=$1
    
    if ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${RED}✗${NC} Port $port: ${RED}SUDAH DIGUNAKAN${NC}"
        # Tampilkan proses yang menggunakan port
        echo "  Proses yang menggunakan:"
        ss -tuln 2>/dev/null | grep ":$port " | awk '{print "  - " $0}'
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $port: ${GREEN}TERSEDIA${NC}"
        return 0
    fi
}

# Function untuk find port yang tersedia
find_available_port() {
    local start_port=${1:-3000}
    local end_port=${2:-3100}
    
    echo ""
    echo "Mencari port tersedia antara $start_port - $end_port..."
    echo ""
    
    for port in $(seq $start_port $end_port); do
        if ! ss -tuln 2>/dev/null | grep -q ":$port "; then
            echo -e "${GREEN}✓${NC} Port ${GREEN}$port${NC} tersedia (RECOMMENDED)"
            return 0
        fi
    done
    
    echo -e "${RED}✗${NC} Tidak ada port tersedia dalam range $start_port - $end_port"
    return 1
}

# Menu utama
if [ $# -eq 0 ]; then
    echo "Usage: $0 [COMMAND] [PORT]"
    echo ""
    echo "Commands:"
    echo "  check <port>    - Check status port tertentu"
    echo "  find [start] [end] - Find available port (default: 3000-3100)"
    echo "  list            - List semua port yang sedang digunakan"
    echo "  busy            - Tampilkan port yang sedang sibuk"
    echo ""
    echo "Contoh:"
    echo "  $0 check 3000"
    echo "  $0 find"
    echo "  $0 find 5000 5100"
    echo "  $0 list"
    echo ""
    exit 0
fi

command=$1

case $command in
    check)
        if [ -z "$2" ]; then
            echo "Error: Port tidak diberikan"
            echo "Usage: $0 check <port>"
            exit 1
        fi
        check_port_ss "$2" || check_port "$2"
        ;;
    find)
        if [ -z "$2" ]; then
            find_available_port 3000 3100
        elif [ -z "$3" ]; then
            find_available_port "$2" $((2 + 100))
        else
            find_available_port "$2" "$3"
        fi
        ;;
    list)
        echo "Port yang sedang digunakan:"
        echo ""
        if command -v ss &> /dev/null; then
            ss -tuln | grep LISTEN | awk 'NR>1 {print "  " $0}'
        else
            netstat -tuln | grep LISTEN | awk 'NR>1 {print "  " $0}'
        fi
        ;;
    busy)
        echo "Port yang sedang digunakan (listening):"
        echo ""
        if command -v ss &> /dev/null; then
            ss -tuln | grep LISTEN | grep -E ':(80|443|3000|3001|3002|8000|8080|8443)' | awk 'NR>1 {print "  " $0}'
        else
            netstat -tuln | grep LISTEN | grep -E ':(80|443|3000|3001|3002|8000|8080|8443)' | awk 'NR>1 {print "  " $0}'
        fi
        ;;
    *)
        echo "Unknown command: $command"
        echo "Usage: $0 [check|find|list|busy] [arguments]"
        exit 1
        ;;
esac

echo ""
