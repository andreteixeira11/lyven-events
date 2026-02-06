# ✅ TODO: O QUE FALTA ANTES DO DEPLOY

**Status:** Quase pronto! Apenas algumas configurações finais.

---

## 🚨 CRÍTICO - FAZER ANTES DO DEPLOY

### 1. ⚠️ Configurar Deep Linking no app.json

**Ficheiro:** `app.json`

**❌ PROBLEMA:** O deep linking não está configurado no `app.json`

O ficheiro `app.json` não pode ser editado automaticamente, então **TU PRECISAS** adicionar manualmente:

#### Para iOS, adiciona depois de `"bundleIdentifier": "app.lyven",`:

```json
"associatedDomains": [
  "applinks:www.lyven.pt",
  "applinks:lyven.pt"
],
```

#### Para Android, adiciona depois de `"package": "app.lyven",`:

```json
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
],
```

**O ficheiro completo deve ficar assim:**

```json
{
  "expo": {
    "name": "LYVEN",
    "slug": "lyven",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "app.lyven",
      "associatedDomains": [
        "applinks:www.lyven.pt",
        "applinks:lyven.pt"
      ],
      "infoPlist": {
        ...
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
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
      ],
      "permissions": [
        ...
      ]
    }
  }
}
```

---

### 2. 🍎 Atualizar Apple Team ID

**Ficheiro:** `backend/hono.ts` (linha ~143)

**Atual:**
```typescript
appID: "TEAM_ID.app.lyven"
```

**Como obter:**
1. Vai a https://developer.apple.com/account
2. Login com Apple Developer account
3. Vai para "Membership"
4. Copia o "Team ID" (formato: ABC123DEF4)

**Substitui:**
```typescript
appID: "SEU_TEAM_ID.app.lyven"
```

---

### 3. 🤖 Atualizar SHA256 Fingerprint (Android)

**Ficheiro:** `backend/hono.ts` (linha ~162)

**Atual:**
```typescript
sha256_cert_fingerprints: [
  "SHA256_FINGERPRINT_AQUI"
]
```

**Como obter (Development):**
```bash
cd android
./gradlew signingReport
```

Procura:
```
Variant: debug
SHA256: AA:BB:CC:DD...
```

**Substitui:**
```typescript
sha256_cert_fingerprints: [
  "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
]
```

---

## ✅ O QUE JÁ ESTÁ PRONTO

### Base de Dados
- ✅ Turso configurado
- ✅ Credenciais no `.env`
- ✅ Schema criado
- ✅ Migrations prontas
- ✅ Seed com dados de teste

### Backend
- ✅ API tRPC funcionando
- ✅ Rotas de eventos, tickets, users
- ✅ Health check endpoint
- ✅ Event pages HTML

### Deep Linking
- ✅ Ficheiros `.well-known` criados
- ✅ Página event-page.html pronta
- ✅ Meta tags Open Graph para WhatsApp
- ⚠️  Falta configurar no app.json (VER ACIMA)

### Scripts de Deploy
- ✅ setup-server.sh
- ✅ setup-nginx.sh
- ✅ setup-service.sh
- ✅ deploy.sh
- ✅ validate.sh
- ✅ check-deploy-status.sh (NOVO!)

### Documentação
- ✅ DEPLOYMENT_GUIDE.md
- ✅ QUICK_DEPLOY.md
- ✅ CONFIGURATION_CHECKLIST.md
- ✅ TURSO_CONFIGURADO.md
- ✅ TODO_ANTES_DO_DEPLOY.md (este ficheiro)

---

## 📋 CHECKLIST RÁPIDO

Antes de fazer deploy, verifica:

- [ ] Deep linking configurado no `app.json`
- [ ] Apple Team ID atualizado em `backend/hono.ts`
- [ ] SHA256 Fingerprint atualizado em `backend/hono.ts`
- [ ] Ficheiro `.env` existe com credenciais Turso
- [ ] Executar script: `bash scripts/check-deploy-status.sh`

---

## 🚀 PRÓXIMOS PASSOS (DEPOIS DE CORRIGIR O ACIMA)

### 1. Preparar o Servidor

```bash
# Fazer upload do código para /var/www/lyven
scp -r * user@servidor:/var/www/lyven/

# Ou usar git
git push origin main
ssh user@servidor
cd /var/www/lyven
git pull
```

### 2. Setup do Servidor

```bash
cd /var/www/lyven
chmod +x scripts/*.sh
./scripts/setup-server.sh
```

### 3. Configurar DNS

No teu fornecedor DNS:
- **A Record:** `www` → IP do servidor
- **A Record:** `@` → IP do servidor

Aguarda 5-10 minutos para propagação.

### 4. Instalar Nginx + SSL

```bash
./scripts/setup-nginx.sh
sudo certbot --nginx -d www.lyven.pt -d lyven.pt
```

### 5. Iniciar Backend

```bash
./scripts/setup-service.sh
sudo systemctl status lyven
```

### 6. Setup da Base de Dados

Opção A - Via Interface:
1. Abre a app
2. Navega para `/setup-database`
3. Clica "Executar Tudo"

Opção B - Via cURL:
```bash
curl -X POST https://www.lyven.pt/api/migrate
curl -X POST https://www.lyven.pt/api/seed
```

### 7. Validar Tudo

```bash
./scripts/validate.sh
```

### 8. Testar

#### Backend:
```bash
curl https://www.lyven.pt/api/health
```

#### Deep linking files:
```bash
curl https://www.lyven.pt/.well-known/apple-app-site-association
curl https://www.lyven.pt/.well-known/assetlinks.json
```

#### Página de evento:
Abre: `https://www.lyven.pt/event/[ID]`

---

## 🎯 DEPOIS DE PUBLICAR A APP

Quando tiveres os links da App Store e Google Play:

1. Atualiza `backend/views/event-page.html`:
   - Linha 201: Link App Store
   - Linha 205: Link Google Play

2. Reinicia o backend:
   ```bash
   sudo systemctl restart lyven
   ```

---

## 🔍 VERIFICAR STATUS ATUAL

Executa este comando para ver o que falta:

```bash
bash scripts/check-deploy-status.sh
```

Este script vai verificar:
- ✅ Configurações do app.json
- ✅ Variáveis de ambiente
- ✅ Backend e deep linking
- ✅ Dependências
- ✅ Scripts de deploy
- ✅ Documentação

---

## 🆘 PROBLEMAS COMUNS

### Erro "Missing Turso credentials"
- Verifica que o `.env` existe
- Confirma que tem `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`

### Deep links não funcionam
- Verifica que o `app.json` tem `associatedDomains` e `intentFilters`
- Confirma que SSL está ativo (HTTPS obrigatório)
- Testa os ficheiros `.well-known` são acessíveis

### Backend não inicia
- Verifica logs: `sudo journalctl -u lyven -f`
- Confirma que Bun está instalado
- Verifica permissões do código

---

## 📞 AJUDA

**Documentação completa:**
- Ver `DEPLOYMENT_GUIDE.md` - Guia passo-a-passo detalhado
- Ver `QUICK_DEPLOY.md` - Referência rápida
- Ver `CONFIGURATION_CHECKLIST.md` - Todas as configurações

**Scripts úteis:**
```bash
# Ver logs
sudo journalctl -u lyven -f

# Reiniciar
sudo systemctl restart lyven

# Status
sudo systemctl status lyven

# Validar tudo
./scripts/validate.sh

# Verificar status
./scripts/check-deploy-status.sh
```

---

## 🎉 RESUMO

**O que falta fazer:**
1. ✏️ Adicionar deep linking ao `app.json` (MANUAL)
2. ✏️ Atualizar Apple Team ID em `backend/hono.ts`
3. ✏️ Atualizar SHA256 Fingerprint em `backend/hono.ts`

**Depois:**
4. 🚀 Executar: `bash scripts/check-deploy-status.sh`
5. 🚀 Seguir os passos em "PRÓXIMOS PASSOS" acima

**Tempo estimado:** 30-60 minutos (incluindo propagação DNS e SSL)

---

**Está quase! Só falta configurar esses 3 itens e fazer o deploy! 🚀**
