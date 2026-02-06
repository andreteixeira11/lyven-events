# 🚀 Guia de Deploy - LYVEN

## 📋 Checklist de Deploy

### 1. ✅ Configuração do DNS (www.lyven.pt)

#### Passo 1.1: Apontar DNS para o Backend

No teu fornecedor de DNS (GoDaddy, Namecheap, Cloudflare, etc.), configura:

**Opção A: Servidor Dedicado**
```
Tipo: A Record
Nome: www
Valor: [IP_DO_TEU_SERVIDOR]
TTL: 300
```

**Opção B: Cloudflare (Recomendado)**
```
Tipo: A Record
Nome: www
Valor: [IP_DO_TEU_SERVIDOR]
Proxy Status: DNS only (nuvem cinzenta, não laranja)
TTL: Auto
```

#### Passo 1.2: Verificar DNS
Espera 5-10 minutos e testa:
```bash
ping www.lyven.pt
nslookup www.lyven.pt
```

---

### 2. 🔒 Certificado SSL (OBRIGATÓRIO)

**Opção A: Certbot (Let's Encrypt) - GRÁTIS**

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d www.lyven.pt

# Renovação automática (adicionar ao crontab)
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

**Opção B: Cloudflare SSL - GRÁTIS**

1. Vai ao Cloudflare Dashboard
2. Seleciona o domínio lyven.pt
3. SSL/TLS → Overview
4. Escolhe "Full (strict)" ou "Full"
5. SSL automático ativado ✅

---

### 3. 🌐 Configurar Servidor Web (Nginx)

#### Instalar Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

#### Configurar Nginx para LYVEN

Cria o ficheiro `/etc/nginx/sites-available/lyven`:

```nginx
server {
    listen 80;
    server_name www.lyven.pt lyven.pt;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.lyven.pt lyven.pt;
    
    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/www.lyven.pt/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.lyven.pt/privkey.pem;
    
    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy para backend Node.js (Hono)
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
```

#### Ativar a configuração
```bash
sudo ln -s /etc/nginx/sites-available/lyven /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

---

### 4. 📱 Universal Links (iOS) e App Links (Android)

#### 4.1: Criar ficheiro `.well-known`

Cria a pasta:
```bash
mkdir -p /var/www/html/.well-known
```

#### 4.2: Apple App Site Association

Cria `/var/www/html/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.app.lyven",
        "paths": ["/event/*"]
      }
    ]
  }
}
```

**⚠️ IMPORTANTE:** Substitui `TEAM_ID` pelo teu Apple Developer Team ID

Para encontrar o Team ID:
1. Vai a https://developer.apple.com/account
2. Membership → Team ID

#### 4.3: Android Asset Links

Cria `/var/www/html/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.lyven",
    "sha256_cert_fingerprints": [
      "SHA256_FINGERPRINT_AQUI"
    ]
  }
}]
```

**Como obter SHA256 Fingerprint:**

Para build de debug:
```bash
cd android
./gradlew signingReport
```

Para build de produção, usa a keystore de produção:
```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

#### 4.4: Configurar Nginx para servir `.well-known`

Adiciona ao ficheiro nginx:

```nginx
location /.well-known/apple-app-site-association {
    root /var/www/html;
    default_type application/json;
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}

location /.well-known/assetlinks.json {
    root /var/www/html;
    default_type application/json;
    add_header Content-Type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

Reinicia nginx:
```bash
sudo systemctl restart nginx
```

#### 4.5: Testar ficheiros `.well-known`

```bash
curl https://www.lyven.pt/.well-known/apple-app-site-association
curl https://www.lyven.pt/.well-known/assetlinks.json
```

Ferramentas online:
- iOS: https://branch.io/resources/aasa-validator/
- Android: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.lyven.pt

---

### 5. 📦 Deploy do Backend

#### 5.1: Preparar servidor

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Bun
curl -fsSL https://bun.sh/install | bash
```

#### 5.2: Fazer deploy do código

**Opção A: Git**
```bash
cd /var/www
git clone https://github.com/teu-repo/lyven.git
cd lyven
bun install
```

**Opção B: Upload direto**
```bash
rsync -avz --exclude node_modules --exclude .git ./ user@server:/var/www/lyven/
```

#### 5.3: Configurar variáveis de ambiente

Cria `.env` no servidor:
```bash
cd /var/www/lyven
nano .env
```

```env
NODE_ENV=production
DATABASE_URL=file:./backend/db/lyven.db
PORT=3000
```

#### 5.4: Criar serviço systemd

Cria `/etc/systemd/system/lyven.service`:

```ini
[Unit]
Description=LYVEN Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/lyven
ExecStart=/root/.bun/bin/bun run backend/hono.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### 5.5: Iniciar serviço

```bash
sudo systemctl daemon-reload
sudo systemctl enable lyven
sudo systemctl start lyven
sudo systemctl status lyven
```

Ver logs:
```bash
sudo journalctl -u lyven -f
```

---

### 6. 📝 Atualizar app.json

Atualiza o ficheiro `app.json` com as configurações de deep linking:

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "app.lyven",
      "associatedDomains": [
        "applinks:www.lyven.pt",
        "applinks:lyven.pt"
      ]
    },
    "android": {
      "package": "app.lyven",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "www.lyven.pt",
              "pathPrefix": "/event"
            },
            {
              "scheme": "https",
              "host": "lyven.pt",
              "pathPrefix": "/event"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

---

### 7. 📱 Publicar App nas Lojas

#### 7.1: Build de Produção

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

#### 7.2: Depois de publicar

Guarda os links das lojas e atualiza em `backend/views/event-page.html`:

```html
<!-- Linha 201 -->
<a href="https://apps.apple.com/app/idXXXXXXXXXX" class="cta-button secondary-button">
    Download na App Store
</a>

<!-- Linha 205 -->
<a href="https://play.google.com/store/apps/details?id=app.lyven" class="cta-button secondary-button">
    Download no Google Play
</a>
```

---

### 8. ✅ Testes Finais

#### 8.1: Testar Backend
```bash
curl https://www.lyven.pt/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "database": {
    "status": "connected"
  }
}
```

#### 8.2: Testar Página de Evento

Abre no navegador:
```
https://www.lyven.pt/event/[ID_DE_UM_EVENTO]
```

#### 8.3: Testar Deep Links

**iOS:**
1. Instala a app no iPhone
2. Abre Safari
3. Acede a https://www.lyven.pt/event/[ID]
4. A app deve abrir automaticamente

**Android:**
1. Instala a app no Android
2. Abre Chrome
3. Acede a https://www.lyven.pt/event/[ID]
4. A app deve abrir automaticamente

#### 8.4: Testar Partilha WhatsApp

1. Na app, partilha um evento para WhatsApp
2. Verifica que aparecem:
   - ✅ Título do evento
   - ✅ Imagem do evento
   - ✅ Descrição
   - ✅ Link correto (www.lyven.pt/event/[id])

---

### 9. 🔧 Troubleshooting

#### Problema: DNS não resolve
```bash
# Limpar cache DNS local
sudo systemd-resolve --flush-caches

# Testar DNS
nslookup www.lyven.pt 8.8.8.8
```

#### Problema: SSL não funciona
```bash
# Testar certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --force-renewal
```

#### Problema: Backend não inicia
```bash
# Ver logs
sudo journalctl -u lyven -n 100 --no-pager

# Reiniciar
sudo systemctl restart lyven
```

#### Problema: Deep links não funcionam

**iOS:**
```bash
# Validar apple-app-site-association
curl -v https://www.lyven.pt/.well-known/apple-app-site-association

# Verificar content-type (deve ser application/json)
```

**Android:**
```bash
# Testar asset links
curl https://www.lyven.pt/.well-known/assetlinks.json

# Validar online
# https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.lyven.pt
```

#### Problema: App não abre automaticamente

1. Desinstala a app
2. Reinstala
3. Limpa os dados da app
4. Testa novamente

---

### 10. 📊 Monitorização (Opcional)

#### PM2 (Alternativa a systemd)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar app
pm2 start "bun run backend/hono.ts" --name lyven

# Auto-start no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs lyven

# Monitorizar
pm2 monit
```

#### Logs do Nginx
```bash
# Access logs
tail -f /var/log/nginx/lyven_access.log

# Error logs
tail -f /var/log/nginx/lyven_error.log
```

---

## 🎉 Conclusão

Depois de seguir todos os passos:

✅ Backend online em www.lyven.pt  
✅ SSL configurado  
✅ Deep links funcionam  
✅ Página web mostra eventos  
✅ Partilha no WhatsApp funciona perfeitamente  

**Próximos passos:**
1. Monitorizar logs
2. Configurar backups da base de dados
3. Adicionar analytics (Google Analytics, Mixpanel, etc.)
4. Configurar CDN para imagens (Cloudflare, AWS CloudFront)

---

## 📞 Suporte

Se tiveres problemas:
1. Verifica os logs: `sudo journalctl -u lyven -f`
2. Testa endpoints: `curl https://www.lyven.pt/api/health`
3. Valida DNS: `nslookup www.lyven.pt`
4. Testa SSL: `curl -v https://www.lyven.pt`
