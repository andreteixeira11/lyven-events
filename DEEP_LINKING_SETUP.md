# Configuração do Deep Linking e Website

## Resumo

Criámos um sistema completo de deep linking e landing page web para o domínio **www.lyven.pt**. Este sistema permite:

1. Partilhar eventos com link para www.lyven.pt/event/[id]
2. A página web tenta abrir a app automaticamente
3. Se a app não estiver instalada, mostra informações do evento e links para download

## 🎯 Como Funciona

### 1. Backend - Página Web

**Localização:** `backend/views/event-page.html`

Esta é uma página HTML estática com:
- Meta tags para Open Graph (WhatsApp, Facebook, etc.)
- Design responsivo e bonito
- Detecção automática de mobile vs desktop
- Tentativa de abrir a app via deep link (`myapp://event/[id]`)
- Timeout de 3 segundos para mostrar conteúdo caso a app não abra
- Informações completas do evento
- Links para download na App Store e Google Play

### 2. Backend - Rota de Servidor

**Localização:** `backend/hono.ts` (linha 136-181)

Rota GET `/event/:id` que:
- Busca o evento na base de dados
- Preenche o template HTML com dados reais do evento
- Retorna HTML pronto para ser exibido

### 3. Utilidades de Partilha

**Localização:** `lib/share-utils.ts`

Funções atualizadas para usar `https://www.lyven.pt/event/[id]` em vez de rork.app:
- `shareEvent()` - Partilha evento com texto e link
- `shareEventWithImage()` - Partilha evento com imagem (WhatsApp)
- `shareTicket()` - Partilha bilhete
- `shareTicketWithImage()` - Partilha bilhete com imagem

## 🔧 Configuração Necessária

### 1. DNS e Hospedagem

Para que o sistema funcione completamente, precisas de configurar:

#### Opção A: Backend no mesmo domínio
Configure o DNS de **www.lyven.pt** para apontar para o servidor do backend:
- Tipo: A Record
- Nome: www
- Valor: IP do servidor backend

#### Opção B: Backend separado com proxy reverso
1. Hospede o backend em servidor separado
2. Configure nginx/apache no www.lyven.pt para fazer proxy:

```nginx
server {
    listen 80;
    server_name www.lyven.pt;
    
    location /event/ {
        proxy_pass http://BACKEND_IP:3000/event/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://BACKEND_IP:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Universal Links (iOS)

Para deep links funcionarem automaticamente no iOS sem mostrar confirmação:

#### 1. Criar arquivo apple-app-site-association

Cria o ficheiro e hospeda em `https://www.lyven.pt/.well-known/apple-app-site-association`:

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

**Nota:** Substitui `TEAM_ID` pelo teu Apple Team ID

#### 2. Atualizar app.json

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:www.lyven.pt"]
    }
  }
}
```

### 3. App Links (Android)

Para deep links funcionarem automaticamente no Android:

#### 1. Gerar assetlinks.json

Hospeda em `https://www.lyven.pt/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.lyven",
    "sha256_cert_fingerprints": [
      "SHA256_DO_CERTIFICADO_AQUI"
    ]
  }
}]
```

#### 2. Atualizar app.json

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "www.lyven.pt",
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

### 4. Links para App Stores

Atualiza os links na página HTML quando tiveres a app publicada:

**Localização:** `backend/views/event-page.html` (linhas 96-103)

```html
<!-- iOS -->
<a href="https://apps.apple.com/app/idXXXXXXXXXX" class="cta-button secondary-button">
    Download na App Store
</a>

<!-- Android -->
<a href="https://play.google.com/store/apps/details?id=app.lyven" class="cta-button secondary-button">
    Download no Google Play
</a>
```

## 📱 Testando Localmente

### 1. Iniciar Backend

```bash
bun run backend/hono.ts
```

### 2. Testar Página Web

Acede a: `http://localhost:3000/event/[ID_DE_UM_EVENTO]`

### 3. Testar Deep Link na App

Na app, tenta partilhar um evento. O link gerado será `https://www.lyven.pt/event/[id]`

## 🎨 Personalização da Página

A página em `backend/views/event-page.html` pode ser customizada:

### Cores e Design
- Alterar gradientes nas linhas 24 e 88
- Modificar cores dos botões
- Ajustar espaçamentos e tamanhos

### Conteúdo
- Modificar textos e emojis
- Adicionar mais informações do evento
- Incluir reviews, preços detalhados, etc.

### Imagens e Logo
- Substituir o logo text por imagem
- Adicionar favicon
- Incluir mais fotos do evento

## 🔍 Meta Tags para SEO e Redes Sociais

A página já inclui meta tags Open Graph para melhor preview em:
- WhatsApp
- Facebook
- Twitter/X
- LinkedIn
- Telegram

Quando alguém partilha o link, aparecem:
- Título do evento
- Descrição
- Imagem do evento
- Link correto

## 📊 Analytics (Opcional)

Podes adicionar tracking à página:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## ✅ Checklist de Deploy

- [ ] Backend em produção e acessível
- [ ] DNS configurado para www.lyven.pt
- [ ] Certificado SSL instalado (HTTPS obrigatório)
- [ ] apple-app-site-association configurado
- [ ] assetlinks.json configurado
- [ ] Links da App Store/Play Store atualizados
- [ ] Testar deep links no iOS
- [ ] Testar deep links no Android
- [ ] Testar partilha no WhatsApp
- [ ] Testar partilha no Facebook
- [ ] Verificar meta tags aparecem corretamente

## 🚀 Próximos Passos

1. **Publicar Backend**: Deploy do backend para servidor de produção
2. **Configurar DNS**: Apontar www.lyven.pt para o backend
3. **SSL/HTTPS**: Instalar certificado (obrigatório para deep links)
4. **Publicar App**: Submit para App Store e Google Play
5. **Atualizar Links**: Colocar links reais das lojas
6. **Testar**: Verificar todo o fluxo funciona

## 📝 Notas Importantes

- **HTTPS é obrigatório** para Universal Links e App Links funcionarem
- O domínio deve ser verificável (não pode ser localhost ou IP)
- Os ficheiros `.well-known` devem ser acessíveis sem autenticação
- O content-type do apple-app-site-association deve ser `application/json`
- Testar em dispositivos reais, não apenas simuladores

## 💡 Dicas

- Usa ferramentas como [Branch.io App Link Validator](https://branch.io/resources/aasa-validator/) para validar
- Testa links em vários apps (WhatsApp, Messenger, Email, etc.)
- Monitoriza os logs do backend para ver quais eventos são mais partilhados
- Considera adicionar parâmetros UTM para tracking
