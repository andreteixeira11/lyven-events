#!/bin/bash

# Script para validar configuração e testar deep links

echo "🔍 A validar configuração do LYVEN..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="www.lyven.pt"
ERRORS=0

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testando $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ERRO (HTTP $response)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Função para testar JSON endpoint
test_json_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testando $description... "
    
    response=$(curl -s "$url")
    content_type=$(curl -s -I "$url" | grep -i "content-type" | grep -i "json")
    
    if [ ! -z "$response" ] && [ ! -z "$content_type" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ERRO${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

echo ""
echo "=== Testes de Backend ==="
test_endpoint "https://$DOMAIN/api/health" "Health Check"
test_endpoint "https://$DOMAIN/" "Root Endpoint"

echo ""
echo "=== Testes de Deep Linking ==="
test_json_endpoint "https://$DOMAIN/.well-known/apple-app-site-association" "Apple App Site Association"
test_json_endpoint "https://$DOMAIN/.well-known/assetlinks.json" "Android Asset Links"

echo ""
echo "=== Verificar Certificado SSL ==="
echo -n "SSL válido... "
ssl_check=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | grep "Verify return code: 0")
if [ ! -z "$ssl_check" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERRO${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Verificar DNS ==="
echo -n "DNS a resolver... "
dns_check=$(nslookup $DOMAIN | grep "Address" | tail -n 1)
if [ ! -z "$dns_check" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "  $dns_check"
else
    echo -e "${RED}❌ ERRO${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=== Verificar Serviço ==="
if command -v systemctl &> /dev/null; then
    echo -n "Serviço LYVEN a correr... "
    if systemctl is-active --quiet lyven; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ERRO${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""
echo "=== Validadores Online ==="
echo "Valida manualmente em:"
echo "  iOS: https://branch.io/resources/aasa-validator/"
echo "       URL: https://$DOMAIN/.well-known/apple-app-site-association"
echo ""
echo "  Android: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://$DOMAIN"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS teste(s) falharam${NC}"
    exit 1
fi
