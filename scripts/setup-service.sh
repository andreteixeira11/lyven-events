#!/bin/bash

# Script para configurar serviço systemd para LYVEN

set -e

echo "⚙️ Configurando serviço systemd para LYVEN..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está a correr como root
if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Obter caminho do Bun
BUN_PATH=$(which bun || echo "/root/.bun/bin/bun")

# Criar serviço systemd
echo -e "${YELLOW}📝 A criar serviço systemd...${NC}"

cat > /etc/systemd/system/lyven.service << EOF
[Unit]
Description=LYVEN Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/lyven
ExecStart=$BUN_PATH run backend/hono.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Recarregar systemd
echo -e "${YELLOW}🔄 A recarregar systemd...${NC}"
systemctl daemon-reload

# Ativar serviço
echo -e "${YELLOW}✅ A ativar serviço...${NC}"
systemctl enable lyven

# Iniciar serviço
echo -e "${YELLOW}🚀 A iniciar serviço...${NC}"
systemctl start lyven

# Mostrar status
echo ""
systemctl status lyven --no-pager

echo ""
echo -e "${GREEN}✅ Serviço configurado e iniciado!${NC}"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo "  Ver logs:      sudo journalctl -u lyven -f"
echo "  Reiniciar:     sudo systemctl restart lyven"
echo "  Parar:         sudo systemctl stop lyven"
echo "  Ver status:    sudo systemctl status lyven"
