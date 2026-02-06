# Guia de Integração Externa - API Lyven

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Formato de Requisições](#formato-de-requisições)
4. [Casos de Uso Principais](#casos-de-uso-principais)
5. [Exemplos de Código](#exemplos-de-código)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Rate Limiting](#rate-limiting)
8. [Webhooks](#webhooks)
9. [Ambientes](#ambientes)

---

## 🌐 Visão Geral

A API Lyven permite integração completa com plataformas externas para:
- Criar e gerir eventos
- Submeter eventos para aprovação administrativa
- Consultar estatísticas e analytics
- Gerir bilhetes e validações
- Receber notificações via webhook

**Base URL**: `https://your-domain.com/api/trpc`

**Protocolo**: tRPC sobre HTTP/HTTPS

---

## 🔐 Autenticação

### Método 1: User ID Header (Atual)
```http
X-User-Id: user_id_aqui
```

### Método 2: API Key (Webhooks)
```json
{
  "apiKey": "your-api-key-here"
}
```

### Obter Credenciais
1. Crie uma conta na plataforma Lyven
2. Solicite credenciais de API ao suporte
3. Guarde o User ID ou API Key de forma segura

⚠️ **Importante**: Nunca exponha suas credenciais no frontend ou em repositórios públicos.

---

## 📡 Formato de Requisições

### Estrutura Base
Todas as requisições seguem o formato tRPC:

```http
POST /api/trpc/[procedureName]
Content-Type: application/json

{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

### Estrutura de Resposta
```json
{
  "result": {
    "data": {
      // Dados retornados
    }
  }
}
```

### Resposta de Erro
```json
{
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE",
    "data": {
      // Detalhes adicionais
    }
  }
}
```

---

## 🎯 Casos de Uso Principais

### 1. Site de Promotor → Criar Eventos na App

**Cenário**: Um promotor tem um site próprio e quer que os eventos apareçam automaticamente na app Lyven.

**Fluxo**:
1. Promotor cria evento no seu site
2. Site faz request para API Lyven
3. Evento fica pendente de aprovação
4. Admin aprova na app
5. Evento fica visível para utilizadores

**Endpoint**: `POST /api/trpc/events.create`

**Exemplo**:
```javascript
const response = await fetch('https://lyven.app/api/trpc/events.create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Festival de Verão 2025',
    artists: JSON.stringify([
      {
        id: 'artist_1',
        name: 'Artista Principal',
        genre: 'Pop',
        image: 'https://example.com/artist.jpg'
      }
    ]),
    venueName: 'Estádio Nacional',
    venueAddress: 'Alameda das Linhas de Torres',
    venueCity: 'Lisboa',
    venueCapacity: 50000,
    date: '2025-07-15T20:00:00.000Z',
    endDate: '2025-07-17T23:00:00.000Z',
    image: 'https://example.com/festival.jpg',
    description: 'O maior festival de verão de Portugal',
    category: 'festival',
    ticketTypes: JSON.stringify([
      {
        id: 'daily',
        name: 'Diária',
        price: 50,
        available: 10000,
        maxPerPerson: 4
      },
      {
        id: 'pass',
        name: 'Passe 3 Dias',
        price: 120,
        available: 5000,
        maxPerPerson: 4
      }
    ]),
    promoterId: 'promoter_123',
    tags: JSON.stringify(['festival', 'verão', 'música']),
    latitude: 38.7500,
    longitude: -9.1900,
    socialLinks: {
      instagram: 'https://instagram.com/festival',
      facebook: 'https://facebook.com/festival',
      website: 'https://festival.com'
    }
  })
});

const data = await response.json();
console.log('Evento criado:', data.result.data.id);
```

---

### 2. Sistema Externo → Consultar Eventos Pendentes

**Cenário**: Plataforma externa de administração que lista eventos aguardando aprovação.

**Endpoint**: `POST /api/trpc/events.listPending`

**Exemplo**:
```javascript
const response = await fetch('https://lyven.app/api/trpc/events.listPending', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'admin_user_id'
  },
  body: JSON.stringify({
    limit: 50,
    offset: 0
  })
});

const data = await response.json();
const pendingEvents = data.result.data.events;

pendingEvents.forEach(event => {
  console.log(`${event.title} - ${event.date}`);
});
```

---

### 3. Sistema Externo → Aprovar/Rejeitar Eventos

**Cenário**: Dashboard externo de administração para aprovar eventos.

**Aprovar**:
```javascript
await fetch('https://lyven.app/api/trpc/events.approve', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'admin_user_id'
  },
  body: JSON.stringify({
    id: 'event_123'
  })
});
```

**Rejeitar**:
```javascript
await fetch('https://lyven.app/api/trpc/events.reject', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'admin_user_id'
  },
  body: JSON.stringify({
    id: 'event_123',
    reason: 'Informações incompletas. Por favor, adicione descrição detalhada.'
  })
});
```

---

### 4. Sistema de Bilheteira → Validar Bilhetes

**Cenário**: App de portaria para validar bilhetes via QR code.

**Endpoint**: `POST /api/trpc/tickets.validate`

**Exemplo**:
```javascript
const qrCode = 'TICKET_ABC123XYZ';

const response = await fetch('https://lyven.app/api/trpc/tickets.validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    qrCode: qrCode
  })
});

const data = await response.json();
const validation = data.result.data;

if (validation.valid) {
  console.log('✅ Bilhete válido');
  console.log('Evento:', validation.event.title);
  console.log('Utilizador:', validation.ticket.userId);
} else {
  console.log('❌ Bilhete inválido:', validation.message);
}
```

---

### 5. Dashboard Externo → Analytics

**Cenário**: Visualizar estatísticas da plataforma num dashboard externo.

**Endpoint**: `POST /api/trpc/analytics.dashboard`

**Exemplo**:
```javascript
const response = await fetch('https://lyven.app/api/trpc/analytics.dashboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'admin_user_id'
  },
  body: JSON.stringify({
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z'
  })
});

const data = await response.json();
const stats = data.result.data;

console.log('Total Utilizadores:', stats.totalUsers);
console.log('Total Eventos:', stats.totalEvents);
console.log('Bilhetes Vendidos:', stats.totalTicketsSold);
console.log('Receita Total:', stats.totalRevenue, '€');
```

---

## 💻 Exemplos de Código

### Node.js / JavaScript

```javascript
// Função helper para fazer requests
async function lyvenAPI(endpoint, data, userId = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  const response = await fetch(`https://lyven.app/api/trpc/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result.result.data;
}

// Usar a função
const event = await lyvenAPI('events.create', {
  title: 'Novo Evento',
  // ... outros campos
});
```

---

### Python

```python
import requests
import json

class LyvenAPI:
    def __init__(self, base_url, user_id=None):
        self.base_url = base_url
        self.user_id = user_id
    
    def request(self, endpoint, data):
        headers = {'Content-Type': 'application/json'}
        
        if self.user_id:
            headers['X-User-Id'] = self.user_id
        
        response = requests.post(
            f'{self.base_url}/api/trpc/{endpoint}',
            headers=headers,
            json=data
        )
        
        result = response.json()
        
        if 'error' in result:
            raise Exception(result['error']['message'])
        
        return result['result']['data']

# Usar a classe
api = LyvenAPI('https://lyven.app', user_id='admin_123')

events = api.request('events.listPending', {
    'limit': 50,
    'offset': 0
})

for event in events['events']:
    print(f"{event['title']} - {event['date']}")
```

---

### PHP

```php
<?php

class LyvenAPI {
    private $baseUrl;
    private $userId;
    
    public function __construct($baseUrl, $userId = null) {
        $this->baseUrl = $baseUrl;
        $this->userId = $userId;
    }
    
    public function request($endpoint, $data) {
        $headers = ['Content-Type: application/json'];
        
        if ($this->userId) {
            $headers[] = 'X-User-Id: ' . $this->userId;
        }
        
        $ch = curl_init($this->baseUrl . '/api/trpc/' . $endpoint);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if (isset($result['error'])) {
            throw new Exception($result['error']['message']);
        }
        
        return $result['result']['data'];
    }
}

// Usar a classe
$api = new LyvenAPI('https://lyven.app', 'admin_123');

$events = $api->request('events.listPending', [
    'limit' => 50,
    'offset' => 0
]);

foreach ($events['events'] as $event) {
    echo $event['title'] . ' - ' . $event['date'] . "\n";
}

?>
```

---

### cURL

```bash
# Criar evento
curl -X POST https://lyven.app/api/trpc/events.create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concerto Test",
    "artists": "[{\"id\":\"1\",\"name\":\"Artista\"}]",
    "venueName": "Local",
    "venueAddress": "Morada",
    "venueCity": "Lisboa",
    "venueCapacity": 1000,
    "date": "2025-06-01T20:00:00.000Z",
    "image": "https://example.com/img.jpg",
    "description": "Descrição",
    "category": "music",
    "ticketTypes": "[{\"id\":\"1\",\"name\":\"Geral\",\"price\":20,\"available\":100}]",
    "promoterId": "promoter_123"
  }'

# Listar eventos pendentes (Admin)
curl -X POST https://lyven.app/api/trpc/events.listPending \
  -H "Content-Type: application/json" \
  -H "X-User-Id: admin_user_id" \
  -d '{"limit": 50, "offset": 0}'

# Aprovar evento
curl -X POST https://lyven.app/api/trpc/events.approve \
  -H "Content-Type: application/json" \
  -H "X-User-Id: admin_user_id" \
  -d '{"id": "event_123"}'
```

---

## ⚠️ Tratamento de Erros

### Códigos de Erro Comuns

| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| `BAD_REQUEST` | Dados inválidos ou incompletos | Verificar campos obrigatórios |
| `UNAUTHORIZED` | Autenticação falhou | Verificar User ID ou API Key |
| `FORBIDDEN` | Sem permissões | Verificar role do utilizador |
| `NOT_FOUND` | Recurso não encontrado | Verificar ID do recurso |
| `INTERNAL_SERVER_ERROR` | Erro no servidor | Tentar novamente ou contactar suporte |

### Exemplo de Tratamento

```javascript
try {
  const event = await lyvenAPI('events.create', eventData);
  console.log('Sucesso:', event.id);
} catch (error) {
  if (error.message.includes('UNAUTHORIZED')) {
    console.error('Erro de autenticação. Verifique suas credenciais.');
  } else if (error.message.includes('BAD_REQUEST')) {
    console.error('Dados inválidos:', error.message);
  } else {
    console.error('Erro desconhecido:', error.message);
  }
}
```

---

## 🚦 Rate Limiting

### Limites Atuais
- **Requests por minuto**: 60
- **Requests por hora**: 1000
- **Eventos criados por dia**: 100

### Headers de Resposta
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

### Recomendações
- Implemente retry com backoff exponencial
- Cache responses quando possível
- Use batch operations quando disponíveis

---

## 🔔 Webhooks

### Eventos Disponíveis
- `event.created` - Novo evento criado
- `event.approved` - Evento aprovado
- `event.rejected` - Evento rejeitado
- `ticket.sold` - Bilhete vendido
- `ticket.validated` - Bilhete validado

### Configurar Webhook
```javascript
// Endpoint no seu servidor
app.post('/webhooks/lyven', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'event.approved':
      console.log('Evento aprovado:', event.data.id);
      // Sua lógica aqui
      break;
    
    case 'ticket.sold':
      console.log('Bilhete vendido:', event.data.ticketId);
      // Sua lógica aqui
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 🌍 Ambientes

### Produção
```
Base URL: https://lyven.app/api/trpc
```

### Staging (Teste)
```
Base URL: https://staging.lyven.app/api/trpc
```

### Desenvolvimento Local
```
Base URL: http://localhost:8081/api/trpc
```

---

## 📚 Recursos Adicionais

- [Documentação Completa da API](./API_COMPLETE_DOCUMENTATION.md)
- [Collection do Postman](./backend/postman-collection.json)
- [Especificação OpenAPI](./backend/openapi.json)
- [Exemplos de Webhooks](./WEBHOOK_EXAMPLES.md)

---

## 🆘 Suporte

- **Email**: support@lyven.app
- **Documentação**: https://docs.lyven.app
- **Status da API**: https://status.lyven.app

---

## 📋 Checklist de Integração

- [ ] Obter credenciais (User ID ou API Key)
- [ ] Testar autenticação com endpoint simples
- [ ] Implementar criação de eventos
- [ ] Configurar tratamento de erros
- [ ] Implementar webhooks (se necessário)
- [ ] Testar em ambiente de staging
- [ ] Implementar rate limiting
- [ ] Documentar integração internamente
- [ ] Deploy para produção
- [ ] Monitorizar logs e erros

---

**Última atualização**: Janeiro 2025  
**Versão da API**: 1.0.0
