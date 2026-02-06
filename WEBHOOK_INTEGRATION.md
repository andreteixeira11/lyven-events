# 🎫 Integração de Eventos - Documentação da API

Esta documentação descreve como integrar o vosso site com a aplicação móvel para publicação automática de eventos.

## 📋 Visão Geral

A integração permite que promotores criem eventos no vosso site que serão automaticamente publicados na app móvel através de uma API REST.

## 🔐 Autenticação

Todas as chamadas à API devem incluir uma **API Key** para autenticação.

### Configuração da API Key

A API Key é configurada através da variável de ambiente:
```env
WEBHOOK_API_KEY=sua-chave-secreta-aqui
```

**IMPORTANTE:** Altere a API Key padrão em produção por uma chave segura e aleatória.

---

## 🚀 Endpoint Principal

### Criar Evento

**Endpoint:** `POST /api/trpc/webhooks.createEvent`

**Headers:**
```
Content-Type: application/json
```

---

## 📦 Estrutura do Pedido

### Formato do Payload

```json
{
  "apiKey": "sua-api-key-aqui",
  "event": {
    "title": "Nome do Evento",
    "description": "Descrição detalhada do evento...",
    "category": "music",
    "date": "2025-02-15T20:00:00Z",
    "endDate": "2025-02-15T23:00:00Z",
    "duration": 180,
    
    "venue": {
      "name": "Coliseu do Porto",
      "address": "Rua de Passos Manuel 137",
      "city": "Porto",
      "capacity": 3000,
      "latitude": 41.1496,
      "longitude": -8.6109
    },
    
    "images": {
      "cover": "https://exemplo.com/imagens/evento-capa.jpg"
    },
    
    "promoter": {
      "name": "Promoter Name",
      "image": "https://exemplo.com/imagens/promoter-logo.jpg",
      "description": "Descrição do promotor"
    },
    
    "artists": [
      {
        "name": "Nome do Artista",
        "genre": "Rock",
        "image": "https://exemplo.com/imagens/artista.jpg"
      }
    ],
    
    "ticketTypes": [
      {
        "name": "Early Bird",
        "price": 15.00,
        "available": 500,
        "description": "Bilhete antecipado com desconto",
        "maxPerPerson": 4
      },
      {
        "name": "Normal",
        "price": 25.00,
        "available": 2000,
        "description": "Bilhete normal",
        "maxPerPerson": 10
      },
      {
        "name": "VIP",
        "price": 50.00,
        "available": 200,
        "description": "Acesso VIP com backstage",
        "maxPerPerson": 2
      },
      {
        "name": "Gratuito",
        "price": 0,
        "available": 100,
        "description": "Entrada gratuita (limitada)",
        "maxPerPerson": 1
      }
    ],
    
    "tags": ["rock", "concerto", "indoor"],
    
    "socialLinks": {
      "instagram": "https://instagram.com/evento",
      "facebook": "https://facebook.com/evento",
      "twitter": "https://twitter.com/evento",
      "website": "https://www.evento.com"
    },
    
    "isFeatured": false
  }
}
```

---

## 📝 Descrição dos Campos

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `apiKey` | string | Chave de autenticação |
| `event.title` | string | Título do evento |
| `event.description` | string | Descrição detalhada |
| `event.category` | enum | Categoria: `music`, `theater`, `comedy`, `dance`, `festival`, `other` |
| `event.date` | string | Data/hora início (ISO 8601) |
| `event.venue` | object | Informações do local |
| `event.venue.name` | string | Nome do local |
| `event.venue.address` | string | Morada completa |
| `event.venue.city` | string | Cidade |
| `event.venue.capacity` | number | Capacidade total |
| `event.images.cover` | string (URL) | Imagem de capa |
| `event.promoter.name` | string | Nome do promotor |
| `event.promoter.image` | string (URL) | Logótipo/imagem do promoter |
| `event.ticketTypes` | array | Tipos de bilhetes (min: 1) |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event.endDate` | string | Data/hora fim (ISO 8601) |
| `event.duration` | number | Duração em minutos |
| `event.venue.latitude` | number | Coordenada latitude |
| `event.venue.longitude` | number | Coordenada longitude |
| `event.promoter.description` | string | Descrição do promotor |
| `event.artists` | array | Lista de artistas |
| `event.tags` | array | Tags para categorização |
| `event.socialLinks` | object | Links das redes sociais |
| `event.isFeatured` | boolean | Destacar evento (padrão: false) |

### Estrutura do Ticket Type

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do tipo (ex: Early Bird, Normal, VIP, Gratuito) |
| `price` | number | Preço em € (pode ser 0 para gratuito) |
| `available` | number | Quantidade disponível |
| `description` | string | Descrição opcional |
| `maxPerPerson` | number | Máximo por pessoa (padrão: 10) |

---

## ✅ Resposta de Sucesso

**Status:** 200 OK

```json
{
  "result": {
    "data": {
      "success": true,
      "eventId": "event-1234567890-abc123",
      "message": "Evento criado com sucesso"
    }
  }
}
```

---

## ❌ Respostas de Erro

### API Key Inválida
**Status:** 400 Bad Request
```json
{
  "error": {
    "message": "API Key inválida"
  }
}
```

### Campos Obrigatórios em Falta
**Status:** 400 Bad Request
```json
{
  "error": {
    "message": "Validation error",
    "details": [
      {
        "path": ["event", "title"],
        "message": "Required"
      }
    ]
  }
}
```

---

## 🎯 Tipos de Bilhetes Suportados

A app suporta qualquer nome de bilhete que o promotor definir. Exemplos comuns:

- **Early Bird** - Bilhetes antecipados com desconto
- **Normal** - Bilhete standard
- **VIP** - Acesso especial
- **Backstage** - Acesso aos bastidores
- **Meet & Greet** - Encontro com artistas
- **Gratuito** - Entrada gratuita
- **Estudante** - Desconto para estudantes
- **Grupo** - Desconto para grupos
- **1º Lote, 2º Lote, etc.**

### Preços
- Podem ser decimais (ex: 15.50€)
- Podem ser 0€ para bilhetes gratuitos
- São apresentados em Euros (€)

### Quantidades
- O promotor define quantos bilhetes disponíveis por tipo
- `maxPerPerson` define limite por compra individual

---

## 🖼️ Gestão de Imagens

### Formato Recomendado
- **Tipo:** URLs externas hospedadas no vosso servidor
- **Formato:** JPG, PNG, WebP
- **Tamanho recomendado:** 
  - Capa do evento: 1200x630px
  - Logo promotor: 400x400px
  - Imagem artista: 400x400px

### Segurança
- URLs devem ser HTTPS
- Imagens devem ter CORS configurado para acesso público
- Considere usar CDN para melhor performance

---

## 🔄 Fluxo Completo de Integração

```
1. Promotor cria evento no vosso site
   ↓
2. Vosso site valida os dados
   ↓
3. Vosso site faz POST para /api/trpc/webhooks.createEvent
   ↓
4. API valida API Key
   ↓
5. API cria/atualiza promotor (se necessário)
   ↓
6. API cria evento na base de dados
   ↓
7. Evento é publicado automaticamente na app
   ↓
8. Email de notificação é enviado (opcional)
   ↓
9. API retorna eventId de sucesso
```

---

## 📊 Gestão de Promotores

### Criação Automática
- Se o promotor não existir, é criado automaticamente
- Se já existir (mesmo nome), o existente é usado
- Promotores criados via webhook são automaticamente verificados

### Atributos do Promotor
- Nome único
- Imagem/logótipo
- Descrição
- Status de verificação

---

## 🧪 Exemplo de Teste com cURL

```bash
curl -X POST https://sua-app.com/api/trpc/webhooks.createEvent \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sua-api-key",
    "event": {
      "title": "Festival de Verão 2025",
      "description": "O maior festival de música do ano!",
      "category": "festival",
      "date": "2025-07-15T18:00:00Z",
      "endDate": "2025-07-17T02:00:00Z",
      "venue": {
        "name": "Parque da Cidade",
        "address": "Estrada da Circunvalação",
        "city": "Porto",
        "capacity": 50000,
        "latitude": 41.1621,
        "longitude": -8.6759
      },
      "images": {
        "cover": "https://exemplo.com/festival.jpg"
      },
      "promoter": {
        "name": "Festival Productions",
        "image": "https://exemplo.com/logo.jpg",
        "description": "Organizadores de grandes eventos"
      },
      "ticketTypes": [
        {
          "name": "Passe 3 Dias - Early",
          "price": 89.99,
          "available": 5000,
          "description": "Acesso aos 3 dias do festival",
          "maxPerPerson": 4
        },
        {
          "name": "Bilhete Diário",
          "price": 39.99,
          "available": 15000,
          "description": "Acesso a 1 dia",
          "maxPerPerson": 10
        }
      ],
      "tags": ["festival", "verão", "outdoor"],
      "isFeatured": true
    }
  }'
```

---

## 🔧 Exemplo de Integração em Node.js

```javascript
async function publishEventToApp(eventData) {
  const API_KEY = process.env.APP_API_KEY;
  const API_URL = 'https://sua-app.com/api/trpc/webhooks.createEvent';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        event: eventData
      })
    });

    const result = await response.json();

    if (result.result?.data?.success) {
      console.log('Evento publicado:', result.result.data.eventId);
      return result.result.data.eventId;
    } else {
      throw new Error(result.error?.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao publicar evento:', error);
    throw error;
  }
}
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha a API Key no frontend**
   - Guarde em variáveis de ambiente
   - Use apenas em chamadas server-side

2. **HTTPS Obrigatório**
   - Todas as chamadas devem ser HTTPS
   - Valide certificados SSL

3. **Rate Limiting**
   - Implementem rate limiting no vosso lado
   - Evitem chamadas duplicadas

4. **Validação de Dados**
   - Validem todos os campos antes de enviar
   - Sanitizem URLs de imagens

---

## 📞 Suporte

Para questões técnicas ou problemas com a integração:
- Consulte esta documentação primeiro
- Verifique logs de erro no vosso sistema
- Teste com o exemplo de cURL fornecido

---

## 📝 Notas Finais

- Eventos criados via webhook são automaticamente **publicados** (status: 'published')
- A app sincroniza eventos em tempo real
- Imagens são carregadas on-demand para otimizar performance
- Sistema suporta múltiplos promotores simultaneamente
- Não há limite no número de tipos de bilhetes por evento

---

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025
