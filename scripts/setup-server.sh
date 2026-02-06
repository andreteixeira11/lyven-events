#!/bin/bash

# Script para configurar o servidor de produção LYVEN

set -e

echo "🚀 Iniciando setup do servidor LYVEN..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está a correr como root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script deve ser executado como root${NC}" 
   exit 1
fi

echo -e "${GREEN}✅ A correr como root${NC}"

# 1. Atualizar sistema
echo -e "${YELLOW}📦 A atualizar sistema...${NC}"
apt-get update
apt-get upgrade -y

# 2. Instalar dependências
echo -e "${YELLOW}📦 A instalar dependências...${NC}"
apt-get install -y curl git nginx certbot python3-certbot-nginx

# 3. Instalar Node.js
echo -e "${YELLOW}📦 A instalar Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 4. Instalar Bun
echo -e "${YELLOW}📦 A instalar Bun...${NC}"
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# 5. Criar diretório para o projeto
echo -e "${YELLOW}📁 A criar diretório do projeto...${NC}"
mkdir -p /var/www/lyven
cd /var/www/lyven

echo -e "${GREEN}✅ Setup inicial completo!${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Faz upload do código para /var/www/lyven"
echo "2. Executa: cd /var/www/lyven && bun install"
echo "3. Configura o DNS de www.lyven.pt para apontar ao IP deste servidor"
echo "4. Executa o script de configuração do Nginx: ./scripts/setup-nginx.sh"
echo "5. Configura o SSL: sudo certbot --nginx -d www.lyven.pt -d lyven.pt"
echo "6. Executa o script de serviço: ./scripts/setup-service.sh"
