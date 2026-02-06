# ⚡ Quick Deploy - LYVEN

## 🚀 Deploy em 5 Passos

### 1️⃣ Servidor (Ubuntu/Debian)

```bash
# Executar como root
sudo -i

# Fazer upload dos scripts e código
cd /tmp
# [Faz upload da pasta do projeto para /tmp/lyven]

# Mover para /var/www
mv /tmp/lyven /var/www/lyven
cd /var/www/lyven

# Tornar scripts executáveis
chmod +x scripts/*.sh

# Executar setup
./scripts/setup-server.sh
```

### 2️⃣ DNS

No teu fornecedor de DNS:

```
Tipo: A Record
Nome: www
Valor: [IP_DO_SERVIDOR]
TTL: 300
```

**Testar:** `ping www.lyven.pt`

### 3️⃣ Nginx + SSL

```bash
cd /var/www/lyven

# Configurar Nginx
./scripts/setup-nginx.sh

# Aguardar DNS propagar (5-10 min)

# Instalar SSL
sudo certbot --nginx -d www.lyven.pt -d lyven.pt

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4️⃣ App Backend

```bash
cd /var/www/lyven

# Instalar dependências
bun install

# Inicializar base de dados
bun run backend/db/init.ts

# Seed inicial (opcional)
bun run backend/db/seed.ts

# Configurar serviço
./scripts/setup-service.sh
```

### 5️⃣ Deep Links

**Atualizar Team ID (iOS):**
```bash
nano backend/hono.ts
# Linha 143: TEAM_ID.app.lyven -> [TEU_TEAM_ID].app.lyven
```

**Obter SHA256 (Android):**
```bash
cd android
./gradlew signingReport
# Copiar SHA256 e adicionar em backend/hono.ts linha 162
```

**Reiniciar:**
```bash
systemctl restart lyven
```

---

## ✅ Validação

```bash
cd /var/www/lyven
./scripts/validate.sh
```

Testa manualmente:
- Backend: https://www.lyven.pt/api/health
- Página evento: https://www.lyven.pt/event/[ID]
- AASA: https://www.lyven.pt/.well-known/apple-app-site-association
- Asset Links: https://www.lyven.pt/.well-known/assetlinks.json

---

## 🔧 Comandos Úteis

### Logs
```bash
# Ver logs em tempo real
sudo journalctl -u lyven -f

# Últimos 100 logs
sudo journalctl -u lyven -n 100 --no-pager

# Logs do Nginx
tail -f /var/log/nginx/lyven_error.log
```

### Serviço
```bash
# Status
sudo systemctl status lyven

# Reiniciar
sudo systemctl restart lyven

# Parar
sudo systemctl stop lyven

# Iniciar
sudo systemctl start lyven
```

### Deploy/Atualização
```bash
cd /var/www/lyven
./scripts/deploy.sh
```

---

## 📱 Após Publicar App

1. **Obter URLs das lojas**

2. **Atualizar `backend/views/event-page.html`**:
   - Linha 201: Link App Store
   - Linha 205: Link Google Play

3. **Reiniciar serviço**:
   ```bash
   sudo systemctl restart lyven
   ```

---

## 🆘 Troubleshooting

### Backend não inicia
```bash
# Ver logs
sudo journalctl -u lyven -n 50 --no-pager

# Testar manualmente
cd /var/www/lyven
bun run backend/hono.ts
```

### SSL não funciona
```bash
# Verificar certificado
sudo certbot certificates

# Renovar
sudo certbot renew --force-renewal

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Deep links não funcionam

1. **Validar ficheiros:**
   ```bash
   curl -v https://www.lyven.pt/.well-known/apple-app-site-association
   ```

2. **Content-Type deve ser `application/json`**

3. **Validar online:**
   - iOS: https://branch.io/resources/aasa-validator/
   - Android: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.lyven.pt

4. **Reinstalar app** (necessário após alterar configurações)

---

## 📊 Monitorização

### PM2 (Alternativa)
```bash
# Instalar
npm install -g pm2

# Parar systemd
sudo systemctl stop lyven
sudo systemctl disable lyven

# Iniciar com PM2
cd /var/www/lyven
pm2 start "bun run backend/hono.ts" --name lyven
pm2 startup
pm2 save

# Logs
pm2 logs lyven
```

---

## 🔐 Segurança

### Firewall (UFW)
```bash
# Ativar firewall
sudo ufw enable

# Permitir apenas necessário
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Verificar
sudo ufw status
```

### Backups
```bash
# Criar backup da base de dados
cp /var/www/lyven/backend/db/lyven.db /backup/lyven-$(date +%Y%m%d).db

# Automatizar (crontab)
0 3 * * * cp /var/www/lyven/backend/db/lyven.db /backup/lyven-$(date +\%Y\%m\%d).db
```

---

## 📞 Suporte

**Documentação completa:** Ver `DEPLOYMENT_GUIDE.md`

**Checklist completo:** Ver `DEEP_LINKING_SETUP.md`
