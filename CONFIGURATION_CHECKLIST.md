# ⚠️ CONFIGURAÇÕES A ATUALIZAR ANTES DO DEPLOY

## 📝 Checklist de Configurações

### 1. ✅ Apple Team ID (iOS)

**Ficheiro:** `backend/hono.ts` (linha 143)

**Atual:**
```typescript
appID: "TEAM_ID.app.lyven"
```

**Atualizar para:**
```typescript
appID: "[TEU_TEAM_ID].app.lyven"
```

**Como obter o Team ID:**
1. Vai a https://developer.apple.com/account
2. Entra com a tua conta Apple Developer
3. Vai a "Membership"
4. Copia o "Team ID" (formato: ABC123DEF4)

---

### 2. ✅ SHA256 Fingerprint (Android)

**Ficheiro:** `backend/hono.ts` (linha 162)

**Atual:**
```typescript
sha256_cert_fingerprints: [
  "SHA256_FINGERPRINT_AQUI"
]
```

**Como obter:**

#### Para Debug (Desenvolvimento):
```bash
cd android
./gradlew signingReport
```

Procura por:
```
Variant: debug
SHA256: AA:BB:CC:DD...
```

#### Para Release (Produção):
```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

**Formato correto:**
```typescript
sha256_cert_fingerprints: [
  "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
]
```

---

### 3. ✅ Links das App Stores

**Ficheiro:** `backend/views/event-page.html` (linhas 201-207)

**Atual:**
```html
<a href="https://apps.apple.com/app/lyven" class="cta-button secondary-button">
    Download na App Store
</a>

<a href="https://play.google.com/store/apps/details?id=app.lyven" class="cta-button secondary-button">
    Download no Google Play
</a>
```

**Atualizar depois de publicar:**

**iOS:**
```html
<a href="https://apps.apple.com/app/id[APP_ID_AQUI]" class="cta-button secondary-button">
```

**Android:**
```html
<a href="https://play.google.com/store/apps/details?id=app.lyven" class="cta-button secondary-button">
```

---

### 4. ✅ Variáveis de Ambiente (Servidor)

**Ficheiro:** `.env` (criar no servidor em `/var/www/lyven/.env`)

```env
NODE_ENV=production
DATABASE_URL=file:./backend/db/lyven.db
PORT=3000
```

**Opcional (se usares email, notificações, etc.):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=teu-email@gmail.com
SMTP_PASS=tua-password
```

---

### 5. ✅ App.json (Deep Linking)

**⚠️ IMPORTANTE:** O ficheiro `app.json` já está configurado, mas verifica se precisa de ajustes.

**Ficheiro:** `app.json`

**Configurações actuais:**
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
      "intentFilters": [...]
    }
  }
}
```

**Se quiseres alterar o scheme da app:**
- Muda `"scheme": "myapp"` para `"scheme": "lyven"`
- Atualiza também em `backend/views/event-page.html` (linha 197 e 220)

---

## 🔄 Ordem de Configuração

### Antes do Deploy do Backend:

1. ✅ Atualizar Apple Team ID em `backend/hono.ts`
2. ✅ Atualizar SHA256 Fingerprint em `backend/hono.ts`

### Depois do Deploy do Backend:

3. ✅ Testar deep links funcionam
4. ✅ Publicar app nas lojas
5. ✅ Atualizar links das lojas em `event-page.html`
6. ✅ Reiniciar backend: `sudo systemctl restart lyven`

---

## 📋 Checklist Final

Antes de fazer deploy, verifica:

- [ ] Apple Team ID atualizado
- [ ] SHA256 Fingerprint atualizado (pelo menos debug)
- [ ] DNS de www.lyven.pt a apontar para o servidor
- [ ] Certificado SSL instalado (HTTPS obrigatório)
- [ ] Backend a correr em https://www.lyven.pt
- [ ] Ficheiros .well-known acessíveis
- [ ] App buildada com configurações corretas
- [ ] Deep links testados em dispositivos reais

Depois de publicar app:

- [ ] Links das lojas atualizados em event-page.html
- [ ] Backend reiniciado
- [ ] Testar partilha de eventos no WhatsApp
- [ ] Validar deep links automáticos funcionam

---

## 🆘 Como Testar

### 1. Backend
```bash
curl https://www.lyven.pt/api/health
```

### 2. Deep Link Files
```bash
curl https://www.lyven.pt/.well-known/apple-app-site-association
curl https://www.lyven.pt/.well-known/assetlinks.json
```

### 3. Página de Evento
Abre no browser: `https://www.lyven.pt/event/[ID_DE_EVENTO_REAL]`

### 4. Deep Links na App
1. Instala a app no telemóvel
2. Abre o browser
3. Vai a `https://www.lyven.pt/event/[ID]`
4. App deve abrir automaticamente

### 5. Partilha WhatsApp
1. Na app, partilha um evento
2. Seleciona WhatsApp
3. Verifica que:
   - ✅ Imagem aparece
   - ✅ Título e descrição aparecem
   - ✅ Link é www.lyven.pt/event/[id]

---

## 💡 Dicas

### Para Desenvolvimento Local

Enquanto desenvolves, podes usar o domínio `myapp://` que já está configurado. O deep linking web só funciona quando:
- HTTPS está ativo
- Domínio real está configurado
- App está instalada no dispositivo
- Ficheiros .well-known são acessíveis

### Para Testes Beta

Se usares TestFlight (iOS) ou Google Play Beta (Android), os deep links já vão funcionar se as configurações estiverem corretas!

### Validadores Online

**iOS:**
- https://branch.io/resources/aasa-validator/
- Insere: `https://www.lyven.pt/.well-known/apple-app-site-association`

**Android:**
- https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.lyven.pt

---

## 🎯 Próximos Passos

Depois de tudo configurado:

1. **Monitorização**: Configura logs e alertas
2. **Backups**: Automatiza backups da base de dados
3. **Analytics**: Adiciona tracking de eventos e partilhas
4. **CDN**: Considera usar Cloudflare para cache e performance
5. **Escalabilidade**: Prepara para crescimento (load balancer, etc.)

---

**📞 Suporte:** Ver `DEPLOYMENT_GUIDE.md` e `QUICK_DEPLOY.md` para mais detalhes.
