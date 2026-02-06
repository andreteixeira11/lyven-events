#!/bin/bash

# Script para configurar Nginx para LYVEN

set -e

echo "🌐 Configurando Nginx para LYVEN..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está a correr como root
if [[ $EUID -ne 0 ]]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Criar configuração do Nginx
echo -e "${YELLOW}📝 A criar configuração do Nginx...${NC}"

cat > /etc/nginx/sites-available/lyven << 'EOF'
server {
    listen 80;
    server_name www.lyven.pt lyven.pt;
    
    # Redirecionar HTTP para HTTPS (será configurado depois)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Logs
    access_log /var/log/nginx/lyven_access.log;
    error_log /var/log/nginx/lyven_error.log;
}
EOF

# Ativar site
echo -e "${YELLOW}🔗 A ativar site...${NC}"
ln -sf /etc/nginx/sites-available/lyven /etc/nginx/sites-enabled/

# Remover default se existir
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
echo -e "${YELLOW}✅ A testar configuração do Nginx...${NC}"
nginx -t

# Reiniciar Nginx
echo -e "${YELLOW}🔄 A reiniciar Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx configurado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Certifica-te que o DNS está a apontar para este servidor"
echo "2. Testa: curl http://www.lyven.pt"
echo "3. Configura SSL: sudo certbot --nginx -d www.lyven.pt -d lyven.pt"
