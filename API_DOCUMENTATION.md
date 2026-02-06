# Documentação de APIs - Portal Web YVent

## Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [APIs de Utilizadores](#apis-de-utilizadores)
4. [APIs de Eventos](#apis-de-eventos)
5. [APIs de Bilhetes](#apis-de-bilhetes)
6. [APIs de Promotores](#apis-de-promotores)
7. [APIs de Analytics](#apis-de-analytics)
8. [APIs de Administração](#apis-de-administração)
9. [APIs de Anúncios](#apis-de-anúncios)
10. [Webhooks](#webhooks)
11. [Códigos de Erro](#códigos-de-erro)

---

## Visão Geral

### Produção
Base URL: `https://api.yvent.com`
Endpoint tRPC: `https://api.yvent.com/api/trpc`

### Desenvolvimento Local
Base URL: Configurar via `EXPO_PUBLIC_BACKEND_URL`
Endpoint tRPC: `{baseUrl}/api/trpc`

### Tecnologia
Esta API usa **tRPC** com **Drizzle ORM** e **SQLite** como banco de dados.

Todos os requests devem incluir:
```
Content-Type: application/json
Authorization: Bearer {token} (quando aplicável)
```

### Database Schema
O sistema utiliza as seguintes tabelas principais:
- `users` - Dados dos utilizadores
- `promoters` - Informação dos promotores
- `promoter_profiles` - Perfis detalhados dos promotores
- `events` - Eventos criados
- `tickets` - Bilhetes comprados
- `advertisements` - Anúncios da plataforma
- `following` - Relações de seguimento
- `event_statistics` - Estatísticas dos eventos

### Formatos de Data
- Todas as datas estão em formato ISO 8601: `2025-01-22T21:00:00.000Z`

### Paginação
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Autenticação

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_123",
    "name": "João Silva",
    "email": "user@example.com",
    "userType": "normal"
  },
  "expiresIn": 3600
}
```

### Refresh Token
```
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Logout
```
POST /auth/logout
```

---

## APIs de Utilizadores

### Obter Utilizador por ID
```
GET /users/:userId
```

**Response:**
```json
{
  "id": "user_123",
  "name": "João Silva",
  "email": "user@example.com",
  "userType": "normal",
  "interests": ["music", "festival", "theater"],
  "location": {
    "latitude": 38.7223,
    "longitude": -9.1393,
    "city": "Lisboa",
    "region": "Lisboa"
  },
  "preferences": {
    "notifications": true,
    "language": "pt",
    "priceRange": {
      "min": 0,
      "max": 100
    },
    "eventTypes": ["music", "festival"]
  },
  "following": {
    "promoters": ["p1", "p2"],
    "artists": ["a1", "a3"],
    "friends": ["user_456"]
  },
  "favoriteEvents": ["event_1", "event_2"],
  "eventHistory": ["event_3"],
  "createdAt": "2025-01-15T10:00:00.000Z",
  "isOnboardingComplete": true
}
```

### Listar Todos os Utilizadores (Admin/Portal)
```
GET /users
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `userType` (optional: "normal" | "promoter")
- `search` (optional: pesquisa por nome ou email)
- `sortBy` (optional: "createdAt" | "name" | "lastActive")
- `sortOrder` (optional: "asc" | "desc")

**Response:**
```json
{
  "data": [
    {
      "id": "user_123",
      "name": "João Silva",
      "email": "user@example.com",
      "userType": "normal",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "lastActive": "2025-01-22T15:30:00.000Z",
      "totalPurchases": 5,
      "totalSpent": 250.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75
  }
}
```

### Atualizar Utilizador
```
PATCH /users/:userId
```

**Request:**
```json
{
  "name": "João Silva Santos",
  "interests": ["music", "comedy"],
  "preferences": {
    "notifications": false,
    "language": "en"
  }
}
```

### Estatísticas do Utilizador
```
GET /users/:userId/stats
```

**Response:**
```json
{
  "totalTicketsPurchased": 15,
  "totalSpent": 450.75,
  "eventsAttended": 12,
  "favoriteCategories": [
    { "category": "music", "count": 8 },
    { "category": "festival", "count": 4 }
  ],
  "followingCount": {
    "promoters": 5,
    "artists": 12,
    "friends": 23
  },
  "lastPurchase": "2025-01-20T18:00:00.000Z",
  "averageTicketPrice": 30.05,
  "upcomingEvents": 3
}
```

---

## APIs de Eventos

### Listar Eventos
```
GET /events
```

**Query Parameters:**
- `page`, `limit`
- `category` (optional: "music" | "theater" | "comedy" | "dance" | "festival" | "other")
- `city` (optional)
- `dateFrom` (optional: ISO date)
- `dateTo` (optional: ISO date)
- `priceMin`, `priceMax` (optional)
- `isFeatured` (optional: boolean)
- `isSoldOut` (optional: boolean)
- `promoterId` (optional)
- `search` (optional: busca por título, artista, venue)
- `sortBy` (optional: "date" | "price" | "popularity")

**Response:**
```json
{
  "data": [
    {
      "id": "event_1",
      "title": "Arctic Monkeys",
      "artists": [
        {
          "id": "a1",
          "name": "Arctic Monkeys",
          "genre": "Indie Rock",
          "image": "https://..."
        }
      ],
      "venue": {
        "id": "v1",
        "name": "Coliseu dos Recreios",
        "address": "Rua das Portas de Santo Antão",
        "city": "Lisboa",
        "capacity": 3000
      },
      "date": "2025-02-15T21:00:00.000Z",
      "endDate": null,
      "image": "https://...",
      "description": "Os Arctic Monkeys regressam...",
      "category": "music",
      "ticketTypes": [
        {
          "id": "t1",
          "name": "Plateia",
          "price": 45,
          "available": 150,
          "description": "Lugares sentados na plateia",
          "maxPerPerson": 4
        }
      ],
      "isSoldOut": false,
      "isFeatured": true,
      "duration": 120,
      "promoter": {
        "id": "p1",
        "name": "Live Nation Portugal",
        "image": "https://...",
        "description": "Promotora líder...",
        "verified": true,
        "followersCount": 125000
      },
      "tags": ["indie rock", "british", "alternative"],
      "socialLinks": {
        "instagram": "https://instagram.com/arcticmonkeys",
        "facebook": "https://facebook.com/arcticmonkeys"
      },
      "coordinates": {
        "latitude": 38.7223,
        "longitude": -9.1393
      }
    }
  ],
  "pagination": {...}
}
```

### Obter Evento por ID
```
GET /events/:eventId
```

**Response:** Mesmo formato do objeto evento acima

### Criar Evento (Promotor)
```
POST /events
```

**Request:**
```json
{
  "title": "Novo Concerto",
  "artists": [
    {
      "name": "Artista Nome",
      "genre": "Pop",
      "image": "https://..."
    }
  ],
  "venue": {
    "name": "Nome do Local",
    "address": "Morada completa",
    "city": "Lisboa",
    "capacity": 1000
  },
  "date": "2025-03-15T20:00:00.000Z",
  "endDate": "2025-03-15T23:00:00.000Z",
  "image": "https://...",
  "description": "Descrição do evento",
  "category": "music",
  "ticketTypes": [
    {
      "name": "Geral",
      "price": 25,
      "available": 500,
      "maxPerPerson": 4
    }
  ],
  "duration": 180,
  "tags": ["pop", "português"],
  "coordinates": {
    "latitude": 38.7223,
    "longitude": -9.1393
  }
}
```

### Atualizar Evento
```
PATCH /events/:eventId
```

### Eliminar Evento
```
DELETE /events/:eventId
```

### Estatísticas do Evento
```
GET /events/:eventId/statistics
```

**Response:**
```json
{
  "eventId": "event_1",
  "totalTicketsSold": 1250,
  "totalRevenue": 48750.00,
  "ticketTypeStats": [
    {
      "ticketTypeId": "t1",
      "name": "Plateia",
      "sold": 150,
      "revenue": 6750.00,
      "percentage": 100,
      "available": 0
    },
    {
      "ticketTypeId": "t2",
      "name": "Balcão 1",
      "sold": 80,
      "revenue": 2800.00,
      "percentage": 100,
      "available": 0
    },
    {
      "ticketTypeId": "t3",
      "name": "Balcão 2",
      "sold": 1020,
      "revenue": 25500.00,
      "percentage": 84,
      "available": 193
    }
  ],
  "dailySales": [
    {
      "date": "2025-01-15",
      "tickets": 45,
      "revenue": 1575.00
    },
    {
      "date": "2025-01-16",
      "tickets": 78,
      "revenue": 2730.00
    }
  ],
  "demographics": {
    "ageGroups": [
      { "range": "18-24", "count": 350 },
      { "range": "25-34", "count": 520 },
      { "range": "35-44", "count": 280 },
      { "range": "45+", "count": 100 }
    ],
    "locations": [
      { "city": "Lisboa", "count": 800 },
      { "city": "Porto", "count": 250 },
      { "city": "Faro", "count": 150 }
    ]
  },
  "lastUpdated": "2025-01-22T16:00:00.000Z"
}
```

### Compradores do Evento
```
GET /events/:eventId/buyers
```

**Response:**
```json
{
  "data": [
    {
      "userId": "user_123",
      "name": "João Silva",
      "email": "user@example.com",
      "ticketsPurchased": [
        {
          "ticketTypeId": "t1",
          "ticketTypeName": "Plateia",
          "quantity": 2,
          "totalPaid": 90.00,
          "purchaseDate": "2025-01-15T10:00:00.000Z"
        }
      ],
      "checkInStatus": "pending"
    }
  ],
  "pagination": {...}
}
```

---

## APIs de Bilhetes

### Comprar Bilhetes
```
POST /tickets/purchase
```

**Request:**
```json
{
  "items": [
    {
      "eventId": "event_1",
      "ticketTypeId": "t1",
      "quantity": 2
    }
  ],
  "paymentMethod": {
    "type": "credit_card",
    "cardToken": "tok_visa_xxxx"
  }
}
```

**Response:**
```json
{
  "orderId": "order_123456",
  "tickets": [
    {
      "id": "ticket_1",
      "eventId": "event_1",
      "ticketTypeId": "t1",
      "quantity": 2,
      "purchaseDate": "2025-01-22T16:30:00.000Z",
      "qrCode": "QR_event_1_t1_1737564600000",
      "validUntil": "2025-02-15T23:59:59.000Z",
      "isUsed": false
    }
  ],
  "totalPaid": 90.00,
  "status": "completed"
}
```

### Listar Bilhetes do Utilizador
```
GET /users/:userId/tickets
```

**Query Parameters:**
- `status` (optional: "upcoming" | "past" | "all")
- `page`, `limit`

**Response:**
```json
{
  "data": [
    {
      "id": "ticket_1",
      "event": {
        "id": "event_1",
        "title": "Arctic Monkeys",
        "date": "2025-02-15T21:00:00.000Z",
        "venue": "Coliseu dos Recreios",
        "image": "https://..."
      },
      "ticketType": {
        "id": "t1",
        "name": "Plateia"
      },
      "quantity": 2,
      "purchaseDate": "2025-01-15T10:00:00.000Z",
      "qrCode": "QR_event_1_t1_1737564600000",
      "isUsed": false,
      "validUntil": "2025-02-15T23:59:59.000Z",
      "addedToCalendar": true,
      "reminderSet": true
    }
  ],
  "pagination": {...}
}
```

### Validar Bilhete (QR Code Scanner)
```
POST /tickets/validate
```

**Request:**
```json
{
  "qrCode": "QR_event_1_t1_1737564600000",
  "eventId": "event_1"
}
```

**Response:**
```json
{
  "valid": true,
  "ticket": {
    "id": "ticket_1",
    "eventId": "event_1",
    "ticketTypeId": "t1",
    "userId": "user_123",
    "userName": "João Silva",
    "quantity": 2,
    "isUsed": false,
    "purchaseDate": "2025-01-15T10:00:00.000Z"
  },
  "message": "Bilhete válido"
}
```

### Marcar Bilhete como Usado
```
POST /tickets/:ticketId/checkin
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket_1",
    "isUsed": true,
    "checkedInAt": "2025-02-15T21:15:00.000Z"
  }
}
```

### Estatísticas de Bilhetes Vendidos
```
GET /tickets/stats
```

**Query Parameters:**
- `dateFrom`, `dateTo`
- `eventId` (optional)
- `promoterId` (optional)

**Response:**
```json
{
  "totalSold": 15000,
  "totalRevenue": 375000.00,
  "byCategory": [
    { "category": "music", "tickets": 8000, "revenue": 200000.00 },
    { "category": "festival", "tickets": 5000, "revenue": 150000.00 },
    { "category": "theater", "tickets": 2000, "revenue": 25000.00 }
  ],
  "topEvents": [
    {
      "eventId": "event_2",
      "title": "Festival NOS Alive 2025",
      "ticketsSold": 3500,
      "revenue": 262500.00
    }
  ],
  "dailySales": [...]
}
```

---

## APIs de Promotores

### Perfil do Promotor
```
GET /promoters/:promoterId
```

**Response:**
```json
{
  "id": "p1",
  "name": "Live Nation Portugal",
  "image": "https://...",
  "description": "Promotora líder mundial...",
  "verified": true,
  "followersCount": 125000,
  "profile": {
    "userId": "user_p1",
    "companyName": "Live Nation Portugal Lda",
    "website": "https://livenation.pt",
    "socialMedia": {
      "instagram": "https://instagram.com/livenationpt",
      "facebook": "https://facebook.com/livenationpt"
    },
    "isApproved": true,
    "approvalDate": "2024-01-01T00:00:00.000Z",
    "rating": 4.8,
    "totalEvents": 150
  }
}
```

### Listar Promotores
```
GET /promoters
```

**Query Parameters:**
- `page`, `limit`
- `verified` (optional: boolean)
- `isApproved` (optional: boolean)
- `search`

### Eventos do Promotor
```
GET /promoters/:promoterId/events
```

**Query Parameters:**
- `status` (optional: "draft" | "published" | "cancelled" | "completed")
- `page`, `limit`

**Response:**
```json
{
  "data": [
    {
      "id": "event_1",
      "title": "Arctic Monkeys",
      "date": "2025-02-15T21:00:00.000Z",
      "venue": "Coliseu dos Recreios",
      "status": "published",
      "ticketsSold": 1250,
      "totalTickets": 3000,
      "revenue": 48750.00,
      "image": "https://..."
    }
  ],
  "pagination": {...}
}
```

### Dashboard do Promotor
```
GET /promoters/:promoterId/dashboard
```

**Response:**
```json
{
  "overview": {
    "totalEvents": 15,
    "activeEvents": 8,
    "upcomingEvents": 5,
    "completedEvents": 2,
    "totalRevenue": 456000.00,
    "totalTicketsSold": 12500
  },
  "recentSales": {
    "last24h": {
      "tickets": 45,
      "revenue": 1575.00
    },
    "last7days": {
      "tickets": 320,
      "revenue": 11200.00
    },
    "last30days": {
      "tickets": 1250,
      "revenue": 43750.00
    }
  },
  "topEvents": [
    {
      "eventId": "event_1",
      "title": "Arctic Monkeys",
      "ticketsSold": 1250,
      "revenue": 48750.00,
      "occupancyRate": 41.67
    }
  ],
  "upcomingPayouts": [
    {
      "eventId": "event_1",
      "amount": 43875.00,
      "scheduledDate": "2025-02-20T00:00:00.000Z"
    }
  ]
}
```

### Seguidores do Promotor
```
GET /promoters/:promoterId/followers
```

**Response:**
```json
{
  "data": [
    {
      "userId": "user_123",
      "name": "João Silva",
      "followedAt": "2025-01-10T12:00:00.000Z"
    }
  ],
  "pagination": {...},
  "total": 125000
}
```

---

## APIs de Analytics

### Overview Geral (Admin)
```
GET /analytics/overview
```

**Query Parameters:**
- `dateFrom`, `dateTo`

**Response:**
```json
{
  "period": {
    "from": "2025-01-01T00:00:00.000Z",
    "to": "2025-01-22T23:59:59.000Z"
  },
  "users": {
    "total": 15000,
    "new": 450,
    "active": 8500,
    "byType": {
      "normal": 14500,
      "promoter": 500
    }
  },
  "events": {
    "total": 350,
    "published": 280,
    "draft": 40,
    "cancelled": 10,
    "completed": 20,
    "byCategory": {
      "music": 180,
      "festival": 45,
      "theater": 60,
      "comedy": 35,
      "dance": 30
    }
  },
  "tickets": {
    "totalSold": 125000,
    "totalRevenue": 3125000.00,
    "averageTicketPrice": 25.00
  },
  "revenue": {
    "gross": 3125000.00,
    "platformFees": 156250.00,
    "promoterPayouts": 2968750.00
  },
  "topMetrics": {
    "topEvent": {
      "id": "event_2",
      "title": "Festival NOS Alive 2025",
      "ticketsSold": 15000
    },
    "topPromoter": {
      "id": "p1",
      "name": "Live Nation Portugal",
      "revenue": 850000.00
    },
    "topCategory": "music"
  }
}
```

### Analytics por Evento
```
GET /analytics/events
```

**Query Parameters:**
- `dateFrom`, `dateTo`
- `category` (optional)
- `promoterId` (optional)
- `sortBy` (optional: "revenue" | "tickets" | "date")
- `limit` (default: 100)

**Response:**
```json
{
  "data": [
    {
      "eventId": "event_1",
      "title": "Arctic Monkeys",
      "date": "2025-02-15T21:00:00.000Z",
      "category": "music",
      "promoter": "Live Nation Portugal",
      "ticketsSold": 1250,
      "revenue": 48750.00,
      "occupancyRate": 41.67,
      "views": 15000,
      "favorites": 850,
      "shares": 340
    }
  ]
}
```

### Analytics por Promotor
```
GET /analytics/promoters
```

**Response:**
```json
{
  "data": [
    {
      "promoterId": "p1",
      "name": "Live Nation Portugal",
      "totalEvents": 150,
      "activeEvents": 25,
      "totalTicketsSold": 85000,
      "totalRevenue": 2125000.00,
      "averageTicketPrice": 25.00,
      "followers": 125000,
      "rating": 4.8
    }
  ]
}
```

### Analytics Geográficos
```
GET /analytics/geographic
```

**Response:**
```json
{
  "byCity": [
    {
      "city": "Lisboa",
      "events": 180,
      "ticketsSold": 75000,
      "revenue": 1875000.00
    },
    {
      "city": "Porto",
      "events": 95,
      "ticketsSold": 35000,
      "revenue": 875000.00
    }
  ],
  "byRegion": [
    {
      "region": "Lisboa",
      "events": 200,
      "ticketsSold": 85000,
      "revenue": 2125000.00
    }
  ]
}
```

### Tendências
```
GET /analytics/trends
```

**Query Parameters:**
- `period` (optional: "day" | "week" | "month")
- `dateFrom`, `dateTo`

**Response:**
```json
{
  "ticketSales": [
    {
      "date": "2025-01-15",
      "tickets": 450,
      "revenue": 11250.00,
      "events": 5
    }
  ],
  "userGrowth": [
    {
      "date": "2025-01-15",
      "newUsers": 45,
      "activeUsers": 3200
    }
  ],
  "categoryTrends": [
    {
      "category": "music",
      "growth": 15.5,
      "ticketsSold": 8500
    }
  ]
}
```

---

## APIs de Administração

### Listar Utilizadores (Admin)
```
GET /admin/users
```
*(Ver seção de Utilizadores para detalhes)*

### Suspender/Ativar Utilizador
```
PATCH /admin/users/:userId/status
```

**Request:**
```json
{
  "status": "suspended",
  "reason": "Violação dos termos de serviço"
}
```

### Aprovar Promotor
```
POST /admin/promoters/:promoterId/approve
```

**Request:**
```json
{
  "approved": true,
  "notes": "Documentação verificada"
}
```

### Gerir Eventos
```
GET /admin/events
```

**Query Parameters:**
- `status` (optional: "pending_approval" | "approved" | "rejected")
- Demais parâmetros de eventos

### Aprovar/Rejeitar Evento
```
POST /admin/events/:eventId/moderate
```

**Request:**
```json
{
  "action": "approve",
  "notes": "Evento aprovado"
}
```

### Configurações da Plataforma
```
GET /admin/settings
```

**Response:**
```json
{
  "platformFee": {
    "percentage": 5.0,
    "minimum": 0.50
  },
  "payoutSchedule": "weekly",
  "features": {
    "allowPromoterRegistration": true,
    "requireEventApproval": false,
    "enableAdvertisements": true
  },
  "limits": {
    "maxTicketsPerPurchase": 10,
    "maxEventsPerPromoter": 50
  }
}
```

### Atualizar Configurações
```
PATCH /admin/settings
```

---

## APIs de Anúncios

### Listar Anúncios
```
GET /advertisements
```

**Query Parameters:**
- `position` (optional: "home_top" | "home_middle" | "search_results" | "event_detail")
- `isActive` (optional: boolean)
- `page`, `limit`

**Response:**
```json
{
  "data": [
    {
      "id": "ad1",
      "title": "Spotify Premium",
      "description": "Música sem limites...",
      "image": "https://...",
      "targetUrl": "https://spotify.com/premium",
      "type": "banner",
      "position": "home_top",
      "isActive": true,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "impressions": 125000,
      "clicks": 3200,
      "ctr": 2.56,
      "budget": 5000,
      "spent": 3200,
      "targetAudience": {
        "interests": ["music", "festival"],
        "ageRange": { "min": 18, "max": 35 },
        "location": "Lisboa"
      }
    }
  ],
  "pagination": {...}
}
```

### Criar Anúncio
```
POST /advertisements
```

**Request:**
```json
{
  "title": "Novo Anúncio",
  "description": "Descrição",
  "image": "https://...",
  "targetUrl": "https://...",
  "type": "banner",
  "position": "home_top",
  "startDate": "2025-02-01T00:00:00.000Z",
  "endDate": "2025-02-28T23:59:59.000Z",
  "budget": 1000,
  "targetAudience": {
    "interests": ["music"],
    "ageRange": { "min": 18, "max": 35 }
  }
}
```

### Estatísticas de Anúncio
```
GET /advertisements/:adId/stats
```

**Response:**
```json
{
  "adId": "ad1",
  "impressions": 125000,
  "clicks": 3200,
  "ctr": 2.56,
  "conversions": 450,
  "conversionRate": 14.06,
  "spent": 3200,
  "averageCPC": 1.00,
  "roi": 2.5,
  "dailyStats": [
    {
      "date": "2025-01-15",
      "impressions": 5000,
      "clicks": 128,
      "spent": 128
    }
  ]
}
```

### Registrar Impressão
```
POST /advertisements/:adId/impression
```

### Registrar Clique
```
POST /advertisements/:adId/click
```

---

## Webhooks

### Configurar Webhook
```
POST /webhooks
```

**Request:**
```json
{
  "url": "https://your-portal.com/webhooks/yvent",
  "events": [
    "ticket.purchased",
    "event.created",
    "event.updated",
    "user.registered",
    "payout.completed"
  ],
  "secret": "your_webhook_secret"
}
```

### Eventos de Webhook

#### ticket.purchased
```json
{
  "event": "ticket.purchased",
  "timestamp": "2025-01-22T16:30:00.000Z",
  "data": {
    "orderId": "order_123456",
    "userId": "user_123",
    "eventId": "event_1",
    "tickets": [...],
    "totalAmount": 90.00
  }
}
```

#### event.created
```json
{
  "event": "event.created",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "data": {
    "eventId": "event_1",
    "promoterId": "p1",
    "title": "Novo Evento",
    "date": "2025-03-15T20:00:00.000Z"
  }
}
```

#### payout.completed
```json
{
  "event": "payout.completed",
  "timestamp": "2025-01-22T00:00:00.000Z",
  "data": {
    "payoutId": "payout_123",
    "promoterId": "p1",
    "amount": 43875.00,
    "eventId": "event_1",
    "status": "completed"
  }
}
```

---

## Códigos de Erro

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Formato de Erro
```json
{
  "error": {
    "code": "INVALID_TICKET",
    "message": "O bilhete já foi utilizado",
    "details": {
      "ticketId": "ticket_1",
      "usedAt": "2025-02-15T21:15:00.000Z"
    }
  }
}
```

### Códigos de Erro Comuns
- `INVALID_TOKEN` - Token inválido ou expirado
- `INSUFFICIENT_TICKETS` - Bilhetes insuficientes
- `INVALID_TICKET` - Bilhete inválido
- `EVENT_NOT_FOUND` - Evento não encontrado
- `USER_NOT_FOUND` - Utilizador não encontrado
- `PAYMENT_FAILED` - Pagamento falhou
- `UNAUTHORIZED_ACCESS` - Acesso não autorizado
- `VALIDATION_ERROR` - Erro de validação

---

## Rate Limiting

- **Limite padrão:** 100 requests/minuto por IP
- **Limite autenticado:** 1000 requests/minuto por utilizador
- **Headers de resposta:**
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

---

## Ambiente de Testes

**Base URL de Staging:** `https://api-staging.yvent.com/v1`

**Credenciais de Teste:**
```
Admin:
  email: admin@yvent.test
  password: Admin123!

Promotor:
  email: promoter@yvent.test
  password: Promoter123!

Utilizador:
  email: user@yvent.test
  password: User123!
```

**Cartões de Teste:**
- Sucesso: `4242 4242 4242 4242`
- Falha: `4000 0000 0000 0002`

---

## Exemplos de Integração

### JavaScript/TypeScript (Fetch)
```typescript
const API_BASE = 'https://api.yvent.com/v1';
const token = 'your_token_here';

async function getEvents() {
  const response = await fetch(`${API_BASE}/events?page=1&limit=20`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}
```

### cURL
```bash
curl -X GET "https://api.yvent.com/v1/events?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Python (requests)
```python
import requests

API_BASE = 'https://api.yvent.com/v1'
token = 'your_token_here'

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(f'{API_BASE}/events', headers=headers)
data = response.json()
```

---

## Suporte

- **Email:** api-support@yvent.com
- **Documentação:** https://docs.yvent.com
- **Status:** https://status.yvent.com

---

## Integração tRPC

### Visão Geral
Esta API é construída com **tRPC**, que fornece type-safety completo do servidor ao cliente.

### Rotas Disponíveis

#### Utilizadores
```typescript
// Criar utilizador
trpc.users.create.mutate({
  id: string,
  name: string,
  email: string,
  userType: 'normal' | 'promoter',
  interests: string[],
  location: {...},
  preferences: {...}
})

// Obter utilizador
trpc.users.get.query({ id: string })
```

#### Eventos
```typescript
// Listar eventos
trpc.events.list.query({
  category?: 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other',
  search?: string,
  city?: string,
  featured?: boolean
})

// Obter evento específico
trpc.events.get.query({ id: string })

// Criar evento
trpc.events.create.mutate({
  id: string,
  title: string,
  artists: [...],
  venue: {...},
  date: string,
  // ... outros campos
})
```

#### Bilhetes
```typescript
// Criar bilhete
trpc.tickets.create.mutate({
  id: string,
  eventId: string,
  userId: string,
  ticketTypeId: string,
  quantity: number,
  price: number,
  qrCode: string,
  validUntil: string
})

// Listar bilhetes do utilizador
trpc.tickets.list.query({ userId: string })

// Validar bilhete
trpc.tickets.validate.mutate({ qrCode: string })
```

### Exemplo de Uso no Cliente React

```typescript
import { trpc } from '@/lib/trpc';

function EventsList() {
  // Query
  const { data: events, isLoading } = trpc.events.list.useQuery({
    category: 'music',
    featured: true
  });

  // Mutation
  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => {
      console.log('Evento criado com sucesso!');
    }
  });

  const handleCreate = () => {
    createEvent.mutate({
      id: Date.now().toString(),
      title: 'Novo Evento',
      // ... outros campos
    });
  };

  return (
    <div>
      {isLoading && <p>A carregar...</p>}
      {events?.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
      <button onClick={handleCreate}>Criar Evento</button>
    </div>
  );
}
```

### Exemplo de Uso Fora do React

```typescript
import { trpcClient } from '@/lib/trpc';

// Query
const events = await trpcClient.events.list.query({
  category: 'music'
});

// Mutation
const ticket = await trpcClient.tickets.create.mutate({
  id: 'ticket_123',
  eventId: 'event_1',
  userId: 'user_1',
  // ...
});
```

### Base de Dados SQLite

O backend utiliza SQLite com Drizzle ORM. O banco de dados é inicializado automaticamente na primeira execução.

**Localização:** `events.db` na raiz do projeto

**Inicialização:**
```bash
# Criar tabelas
bun run backend/db/migrate.ts

# Popular com dados iniciais
bun run backend/db/seed.ts
```

**Schema Principal:**
- `users` - Utilizadores da plataforma
- `promoters` - Dados dos promotores
- `events` - Eventos publicados
- `tickets` - Bilhetes vendidos
- `advertisements` - Anúncios
- `following` - Relações de seguimento
- `event_statistics` - Métricas dos eventos

### Tipos TypeScript

Todos os tipos são exportados automaticamente pelo tRPC:

```typescript
import type { AppRouter } from '@/backend/trpc/app-router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

// Exemplo de uso
type EventListInput = RouterInput['events']['list'];
type EventListOutput = RouterOutput['events']['list'];
```

---

**Versão:** 1.0.0  
**Última atualização:** 22 de Janeiro de 2025
