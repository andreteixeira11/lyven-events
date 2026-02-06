# 🚀 LYVEN - Resumo do Deploy

## ✅ O que está pronto

### 📱 Deep Linking
- ✅ Página web em www.lyven.pt/event/[id]
- ✅ Tentativa automática de abrir a app
- ✅ Fallback para download se app não instalada
- ✅ Meta tags Open Graph (WhatsApp, Facebook)
- ✅ Configuração iOS (Universal Links)
- ✅ Configuração Android (App Links)

### 🔧 Backend
- ✅ Rota `/event/:id` para páginas de eventos
- ✅ Rota `/.well-known/apple-app-site-association`
- ✅ Rota `/.well-known/assetlinks.json`
- ✅ Health check em `/api/health`
- ✅ Base de dados configurada
- ✅ Logs detalhados

### 📦 Scripts de Deploy
- ✅ `scripts/setup-server.sh` - Setup inicial do servidor
- ✅ `scripts/setup-nginx.sh` - Configuração Nginx
- ✅ `scripts/setup-service.sh` - Serviço systemd
- ✅ `scripts/deploy.sh` - Deploy/atualização
- ✅ `scripts/validate.sh` - Validação e testes

### 📚 Documentação
- ✅ `DEPLOYMENT_GUIDE.md` - Guia completo passo-a-passo
- ✅ `QUICK_DEPLOY.md` - Referência rápida
- ✅ `CONFIGURATION_CHECKLIST.md` - Configurações necessárias
- ✅ `DEEP_LINKING_SETUP.md` - Deep linking detalhado

---

## ⚠️ Antes de fazer deploy

### 1. Configurações obrigatórias

**No código (antes de fazer upload):**

```bash
# 1. Atualizar Apple Team ID
nano backend/hono.ts
# Linha 143: TEAM_ID.app.lyven → [TEU_TEAM_ID].app.lyven

# 2. Atualizar SHA256 Fingerprint (Android)
# Obter com: cd android && ./gradlew signingReport
nano backend/hono.ts
# Linha 162: SHA256_FINGERPRINT_AQUI → [TEU_SHA256]
```

**No servidor (depois do deploy):**

```bash
# 3. Configurar DNS
# No teu fornecedor DNS:
# A Record: www → [IP_DO_SERVIDOR]

# 4. Instalar SSL (obrigatório)
sudo certbot --nginx -d www.lyven.pt -d lyven.pt
```

### 2. Depois de publicar a app

```bash
# 5. Atualizar links das lojas
nano backend/views/event-page.html
# Linha 201: Link App Store
# Linha 205: Link Google Play

# 6. Reiniciar backend
sudo systemctl restart lyven
```

---

## 🎯 Processo de Deploy (5 passos)

```
┌─────────────────────────────────────────────────────────┐
│  1. SERVIDOR                                            │
│  ─────────────────────────────────────────────────────  │
│  • Upload código para /var/www/lyven                    │
│  • Executar: ./scripts/setup-server.sh                  │
│  • Instalar dependências: bun install                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  2. DNS                                                 │
│  ─────────────────────────────────────────────────────  │
│  • Configurar A Record: www → [IP_SERVIDOR]             │
│  • Aguardar propagação (5-10 min)                       │
│  • Testar: ping www.lyven.pt                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  3. NGINX + SSL                                         │
│  ─────────────────────────────────────────────────────  │
│  • Executar: ./scripts/setup-nginx.sh                   │
│  • Instalar SSL: sudo certbot --nginx                   │
│  • Testar: curl https://www.lyven.pt/api/health         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  4. BACKEND                                             │
│  ─────────────────────────────────────────────────────  │
│  • Executar: ./scripts/setup-service.sh                 │
│  • Ver logs: sudo journalctl -u lyven -f                │
│  • Testar: curl https://www.lyven.pt/event/[ID]         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  5. VALIDAR                                             │
│  ─────────────────────────────────────────────────────  │
│  • Executar: ./scripts/validate.sh                      │
│  • Testar deep links em dispositivos reais             │
│  • Testar partilha WhatsApp                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Como vai funcionar

### Fluxo do Utilizador

```
                 ┌──────────────────────┐
                 │  Utilizador partilha │
                 │  evento no WhatsApp  │
                 └──────────┬───────────┘
                            │
                            ↓
                 ┌──────────────────────┐
                 │  Amigo recebe link:  │
                 │  www.lyven.pt/event/ │
                 │  [id]                │
                 └──────────┬───────────┘
                            │
                            ↓
              ┌─────────────┴──────────────┐
              │                            │
              ↓                            ↓
   ┌──────────────────┐        ┌──────────────────┐
   │  App instalada   │        │  App não         │
   │                  │        │  instalada       │
   └────────┬─────────┘        └────────┬─────────┘
            │                           │
            ↓                           ↓
   ┌──────────────────┐        ┌──────────────────┐
   │  App abre        │        │  Página web      │
   │  automaticamente │        │  mostra evento   │
   │  no evento       │        │  + botões        │
   │                  │        │  download        │
   └──────────────────┘        └──────────────────┘
```

### O que acontece tecnicamente

1. **Utilizador partilha evento**
   - App gera link: `https://www.lyven.pt/event/[id]`
   - WhatsApp busca meta tags Open Graph
   - Mostra preview com imagem e título

2. **Amigo clica no link**
   - Browser abre `https://www.lyven.pt/event/[id]`
   - Backend busca evento na base de dados
   - Renderiza HTML com dados do evento

3. **Deep Link tenta abrir app**
   - iOS: Universal Links (associatedDomains)
   - Android: App Links (intentFilters)
   - Se app instalada → abre automaticamente
   - Se não → mostra página web

4. **Página web (fallback)**
   - Mostra informação completa do evento
   - Botões para App Store / Google Play
   - Design bonito e responsivo

---

## 🔍 Como testar

### 1. Backend funcionando
```bash
curl https://www.lyven.pt/api/health
# Resposta: {"status":"ok","message":"Backend is running"}
```

### 2. Deep link files
```bash
curl https://www.lyven.pt/.well-known/apple-app-site-association
# Deve retornar JSON com appID correto

curl https://www.lyven.pt/.well-known/assetlinks.json
# Deve retornar JSON com package_name e SHA256
```

### 3. Página de evento
Abre no browser: `https://www.lyven.pt/event/[ID_EVENTO_EXISTENTE]`
- ✅ Deve mostrar imagem, título, data, local
- ✅ Deve ter botões de download
- ✅ Em mobile, deve tentar abrir app

### 4. Partilha WhatsApp
1. Na app, partilha evento para WhatsApp
2. Verifica preview:
   - ✅ Imagem do evento aparece
   - ✅ Título e descrição
   - ✅ Link: www.lyven.pt/event/[id]

### 5. Deep link funcionando
1. Instala app no telemóvel
2. Abre Safari/Chrome
3. Acede a: `https://www.lyven.pt/event/[id]`
4. ✅ App deve abrir automaticamente (sem confirmação)

---

## 📞 Comandos úteis

```bash
# Ver logs do backend
sudo journalctl -u lyven -f

# Reiniciar backend
sudo systemctl restart lyven

# Ver status do serviço
sudo systemctl status lyven

# Testar health check
curl https://www.lyven.pt/api/health

# Validar tudo
cd /var/www/lyven && ./scripts/validate.sh

# Deploy/atualização
cd /var/www/lyven && ./scripts/deploy.sh
```

---

## 🎉 Quando tudo estiver pronto

✅ Backend online em www.lyven.pt  
✅ SSL configurado (HTTPS)  
✅ Deep links funcionam automaticamente  
✅ Partilha WhatsApp mostra preview bonito  
✅ Página web mostra eventos completos  
✅ Links para App Store / Google Play  

**O sistema está completo e pronto para produção!** 🚀

---

## 📚 Documentação detalhada

- **Deploy completo:** `DEPLOYMENT_GUIDE.md`
- **Referência rápida:** `QUICK_DEPLOY.md`
- **Configurações:** `CONFIGURATION_CHECKLIST.md`
- **Deep linking:** `DEEP_LINKING_SETUP.md`
