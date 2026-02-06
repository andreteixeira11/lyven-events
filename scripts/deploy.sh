#!/bin/bash

# Script de deploy/atualização para LYVEN

set -e

echo "🚀 A fazer deploy do LYVEN..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretório do projeto
PROJECT_DIR="/var/www/lyven"

# Verificar se está a correr como root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script deve ser executado como root${NC}" 
   exit 1
fi

# Ir para diretório do projeto
cd $PROJECT_DIR

# Pull últimas alterações (se estiver a usar git)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 A fazer pull das últimas alterações...${NC}"
    git pull
else
    echo -e "${YELLOW}⚠️  Não é um repositório git. A ignorar pull...${NC}"
fi

# Instalar dependências
echo -e "${YELLOW}📦 A instalar dependências...${NC}"
bun install

# Executar migrações da base de dados (se existirem)
if [ -f "backend/db/migrate.ts" ]; then
    echo -e "${YELLOW}🗄️  A executar migrações da base de dados...${NC}"
    bun run backend/db/migrate.ts
fi

# Reiniciar serviço
echo -e "${YELLOW}🔄 A reiniciar serviço...${NC}"
systemctl restart lyven

# Esperar o serviço iniciar
echo -e "${YELLOW}⏳ A aguardar o serviço iniciar...${NC}"
sleep 3

# Verificar se o serviço está a correr
if systemctl is-active --quiet lyven; then
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo ""
    echo -e "${YELLOW}Status do serviço:${NC}"
    systemctl status lyven --no-pager -l
    echo ""
    echo -e "${YELLOW}Últimos logs:${NC}"
    journalctl -u lyven -n 20 --no-pager
else
    echo -e "${RED}❌ Erro! O serviço não está a correr.${NC}"
    echo ""
    echo -e "${YELLOW}Logs de erro:${NC}"
    journalctl -u lyven -n 50 --no-pager
    exit 1
fi
