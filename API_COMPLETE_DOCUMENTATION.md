# Lyven App - Complete API Documentation

## Base URL
`{baseUrl}/api/trpc/`

## Authentication
Todas as rotas que requerem autenticação necessitam de um header com o userId.

---

## 📋 Table of Contents
1. [Users](#users)
2. [Promoters](#promoters)
3. [Events](#events)
4. [Tickets](#tickets)
5. [Advertisements](#advertisements)
6. [Notifications](#notifications)
7. [Analytics](#analytics)
8. [Social](#social)
9. [Auth](#auth)
10. [Webhooks](#webhooks)

---

## 👤 Users

### `users.create`
Criar novo utilizador
```typescript
Input: {
  name: string;
  email: string;
  userType: 'normal' | 'promoter' | 'admin';
  interests: string[];
  location?: { latitude: number; longitude: number; city: string; region: string };
  preferences: {
    notifications: boolean;
    language: 'pt' | 'en';
    priceRange: { min: number; max: number };
    eventTypes: string[];
  };
}
Output: { id: string; user: User }
```

### `users.get`
Obter dados de um utilizador
```typescript
Input: { id: string }
Output: User
```

### `users.update`
Atualizar dados de um utilizador
```typescript
Input: {
  id: string;
  name?: string;
  email?: string;
  interests?: string[];
  location?: { latitude: number; longitude: number; city: string; region: string };
  preferences?: {
    notifications?: boolean;
    language?: 'pt' | 'en';
    priceRange?: { min: number; max: number };
    eventTypes?: string[];
  };
}
Output: User
```

### `users.delete`
Eliminar utilizador
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `users.list`
Listar todos os utilizadores (Admin)
```typescript
Input: {
  limit?: number;
  offset?: number;
  userType?: 'normal' | 'promoter' | 'admin';
  search?: string;
}
Output: {
  users: User[];
  total: number;
  hasMore: boolean;
}
```

### `users.updateOnboarding`
Marcar onboarding como completo
```typescript
Input: { id: string }
Output: { success: boolean }
```

---

## 🎭 Promoters

### `promoters.create`
Criar perfil de promotor
```typescript
Input: {
  userId: string;
  companyName: string;
  description: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}
Output: PromoterProfile
```

### `promoters.get`
Obter perfil de promotor
```typescript
Input: { id: string }
Output: PromoterProfile
```

### `promoters.update`
Atualizar perfil de promotor
```typescript
Input: {
  id: string;
  companyName?: string;
  description?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}
Output: PromoterProfile
```

### `promoters.delete`
Eliminar perfil de promotor
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `promoters.list`
Listar promotores
```typescript
Input: {
  limit?: number;
  offset?: number;
  approved?: boolean;
  search?: string;
}
Output: {
  promoters: PromoterProfile[];
  total: number;
  hasMore: boolean;
}
```

### `promoters.listPending`
Listar promotores pendentes de aprovação (Admin)
```typescript
Input: { limit?: number; offset?: number }
Output: {
  promoters: PromoterProfile[];
  total: number;
}
```

### `promoters.approve`
Aprovar promotor (Admin)
```typescript
Input: { id: string }
Output: { success: boolean; promoter: PromoterProfile }
```

### `promoters.reject`
Rejeitar promotor (Admin)
```typescript
Input: { id: string; reason?: string }
Output: { success: boolean }
```

### `promoters.stats`
Estatísticas de um promotor
```typescript
Input: { id: string }
Output: {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageRating: number;
  followersCount: number;
  upcomingEvents: number;
}
```

---

## 🎉 Events

### `events.create`
Criar evento
```typescript
Input: {
  title: string;
  artists: string; // JSON string
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCapacity: number;
  date: string;
  endDate?: string;
  image: string;
  description: string;
  category: 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other';
  ticketTypes: string; // JSON string
  promoterId: string;
  tags: string; // JSON string
  latitude?: number;
  longitude?: number;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}
Output: { id: string; event: Event }
```

### `events.get`
Obter detalhes de um evento
```typescript
Input: { id: string }
Output: Event
```

### `events.update`
Atualizar evento
```typescript
Input: {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  ticketTypes?: string;
  status?: 'draft' | 'pending' | 'published' | 'cancelled' | 'completed';
  ... // outros campos opcionais
}
Output: Event
```

### `events.delete`
Eliminar evento
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `events.list`
Listar eventos
```typescript
Input: {
  limit?: number;
  offset?: number;
  category?: string;
  status?: string;
  promoterId?: string;
  search?: string;
  featured?: boolean;
}
Output: {
  events: Event[];
  total: number;
  hasMore: boolean;
}
```

### `events.listPending`
Listar eventos pendentes (Admin)
```typescript
Input: { limit?: number; offset?: number }
Output: {
  events: Event[];
  total: number;
}
```

### `events.getPendingDetails`
Obter detalhes de evento pendente (Admin)
```typescript
Input: { id: string }
Output: Event
```

### `events.approve`
Aprovar evento (Admin)
```typescript
Input: { id: string }
Output: { success: boolean; event: Event }
```

### `events.reject`
Rejeitar evento (Admin)
```typescript
Input: { id: string; reason?: string }
Output: { success: boolean }
```

### `events.featured`
Definir evento como destaque
```typescript
Input: { id: string; featured: boolean }
Output: Event
```

### `events.statistics`
Estatísticas de um evento
```typescript
Input: { id: string }
Output: EventStatistics
```

---

## 🎫 Tickets

### `tickets.create`
Criar bilhete (compra individual)
```typescript
Input: {
  eventId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
}
Output: { tickets: Ticket[]; total: number }
```

### `tickets.batchCreate`
Criar múltiplos bilhetes (compra em lote)
```typescript
Input: {
  userId: string;
  tickets: Array<{
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  }>;
}
Output: {
  tickets: Ticket[];
  total: number;
  purchaseId: string;
}
```

### `tickets.get`
Obter detalhes de um bilhete
```typescript
Input: { id: string }
Output: Ticket
```

### `tickets.list`
Listar bilhetes de um utilizador
```typescript
Input: {
  userId: string;
  eventId?: string;
  used?: boolean;
}
Output: Ticket[]
```

### `tickets.validate`
Validar bilhete (QR Code scan)
```typescript
Input: { qrCode: string }
Output: {
  valid: boolean;
  ticket?: Ticket;
  event?: Event;
  message: string;
}
```

### `tickets.cancel`
Cancelar bilhete
```typescript
Input: { id: string }
Output: { success: boolean; refund: number }
```

### `tickets.transfer`
Transferir bilhete para outro utilizador
```typescript
Input: {
  ticketId: string;
  fromUserId: string;
  toUserId: string;
}
Output: { success: boolean; ticket: Ticket }
```

### `tickets.addToCalendar`
Marcar bilhete como adicionado ao calendário
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `tickets.setReminder`
Definir lembrete para bilhete
```typescript
Input: { id: string }
Output: { success: boolean }
```

---

## 📢 Advertisements

### `advertisements.create`
Criar anúncio
```typescript
Input: {
  title: string;
  description: string;
  image: string;
  targetUrl?: string;
  type: 'banner' | 'card' | 'sponsored_event';
  position: 'home_top' | 'home_middle' | 'search_results' | 'event_detail';
  startDate: string;
  endDate: string;
  budget: number;
  promoterId?: string;
  targetAudience?: {
    interests?: string[];
    ageRange?: { min: number; max: number };
    location?: string;
  };
}
Output: Advertisement
```

### `advertisements.get`
Obter detalhes de um anúncio
```typescript
Input: { id: string }
Output: Advertisement
```

### `advertisements.update`
Atualizar anúncio
```typescript
Input: {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  ... // outros campos opcionais
}
Output: Advertisement
```

### `advertisements.delete`
Eliminar anúncio
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `advertisements.list`
Listar anúncios
```typescript
Input: {
  limit?: number;
  offset?: number;
  type?: string;
  position?: string;
  active?: boolean;
  promoterId?: string;
}
Output: {
  ads: Advertisement[];
  total: number;
}
```

### `advertisements.listPending`
Listar anúncios pendentes (Admin)
```typescript
Input: { limit?: number; offset?: number }
Output: {
  ads: Advertisement[];
  total: number;
}
```

### `advertisements.approve`
Aprovar anúncio (Admin)
```typescript
Input: { id: string }
Output: { success: boolean; ad: Advertisement }
```

### `advertisements.reject`
Rejeitar anúncio (Admin)
```typescript
Input: { id: string; reason?: string }
Output: { success: boolean }
```

### `advertisements.recordImpression`
Registar visualização
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `advertisements.recordClick`
Registar clique
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `advertisements.stats`
Estatísticas de um anúncio
```typescript
Input: { id: string }
Output: {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  budget: number;
  spent: number;
}
```

---

## 🔔 Notifications

### `notifications.registerToken`
Registar token de push notifications
```typescript
Input: {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
}
Output: { success: boolean }
```

### `notifications.send`
Enviar notificação
```typescript
Input: {
  userId: string;
  type: 'event_approved' | 'ad_approved' | 'ticket_sold' | 'event_reminder' | 'follower' | 'system';
  title: string;
  message: string;
  data?: any;
}
Output: { success: boolean; notificationId: string }
```

### `notifications.list`
Listar notificações de um utilizador
```typescript
Input: {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
Output: {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
```

### `notifications.markRead`
Marcar notificação como lida
```typescript
Input: { id: string }
Output: { success: boolean }
```

### `notifications.markAllRead`
Marcar todas como lidas
```typescript
Input: { userId: string }
Output: { success: boolean; count: number }
```

### `notifications.delete`
Eliminar notificação
```typescript
Input: { id: string }
Output: { success: boolean }
```

---

## 📊 Analytics

### `analytics.dashboard`
Dashboard geral (Admin)
```typescript
Input: {
  startDate?: string;
  endDate?: string;
}
Output: {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activePromoters: number;
  pendingApprovals: {
    events: number;
    promoters: number;
    ads: number;
  };
  revenueByDay: Array<{ date: string; revenue: number }>;
  topEvents: Array<{ eventId: string; title: string; tickets: number; revenue: number }>;
}
```

### `analytics.events`
Análise de eventos
```typescript
Input: {
  eventId?: string;
  promoterId?: string;
  startDate?: string;
  endDate?: string;
}
Output: {
  events: Array<{
    eventId: string;
    title: string;
    ticketsSold: number;
    revenue: number;
    capacity: number;
    occupancyRate: number;
  }>;
}
```

### `analytics.promoters`
Análise de promotores
```typescript
Input: {
  promoterId?: string;
  startDate?: string;
  endDate?: string;
}
Output: {
  promoters: Array<{
    promoterId: string;
    name: string;
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    averageOccupancy: number;
  }>;
}
```

### `analytics.revenue`
Análise de receita
```typescript
Input: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}
Output: {
  total: number;
  byPeriod: Array<{
    period: string;
    revenue: number;
    tickets: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}
```

### `analytics.users`
Análise de utilizadores
```typescript
Input: {
  startDate?: string;
  endDate?: string;
}
Output: {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByType: {
    normal: number;
    promoter: number;
    admin: number;
  };
  retentionRate: number;
}
```

---

## 👥 Social

### `social.follow`
Seguir promotor/artista/amigo
```typescript
Input: {
  userId: string;
  targetId: string;
  targetType: 'promoter' | 'artist' | 'friend';
}
Output: { success: boolean }
```

### `social.unfollow`
Deixar de seguir
```typescript
Input: {
  userId: string;
  targetId: string;
  targetType: 'promoter' | 'artist' | 'friend';
}
Output: { success: boolean }
```

### `social.getFollowers`
Obter seguidores
```typescript
Input: {
  targetId: string;
  targetType: 'promoter' | 'artist' | 'user';
  limit?: number;
  offset?: number;
}
Output: {
  followers: User[];
  total: number;
}
```

### `social.getFollowing`
Obter quem está a seguir
```typescript
Input: {
  userId: string;
  type?: 'promoter' | 'artist' | 'friend';
  limit?: number;
  offset?: number;
}
Output: {
  following: Array<{
    id: string;
    type: 'promoter' | 'artist' | 'friend';
    data: any;
  }>;
  total: number;
}
```

### `social.isFollowing`
Verificar se está a seguir
```typescript
Input: {
  userId: string;
  targetId: string;
  targetType: 'promoter' | 'artist' | 'friend';
}
Output: { isFollowing: boolean }
```

---

## 🔐 Auth

### `auth.login`
Login
```typescript
Input: {
  email: string;
  password: string;
}
Output: {
  success: boolean;
  user?: User;
  token?: string;
}
```

### `auth.register`
Registo
```typescript
Input: {
  name: string;
  email: string;
  password: string;
  userType: 'normal' | 'promoter';
}
Output: {
  success: boolean;
  user: User;
  token: string;
}
```

### `auth.forgotPassword`
Recuperar password
```typescript
Input: { email: string }
Output: { success: boolean; message: string }
```

### `auth.resetPassword`
Redefinir password
```typescript
Input: {
  token: string;
  newPassword: string;
}
Output: { success: boolean }
```

### `auth.changePassword`
Alterar password
```typescript
Input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
Output: { success: boolean }
```

---

## 🔗 Webhooks

### `webhooks.createEvent`
Webhook para criar evento
```typescript
POST: /api/trpc/webhooks.createEvent
Input: {
  apiKey: string;
  event: EventData;
}
Output: {
  success: boolean;
  eventId: string;
}
```

---

## ⚙️ Emails

### `emails.sendTest`
Enviar email de teste
```typescript
Input: {
  to: string;
  subject: string;
  body: string;
}
Output: { success: boolean }
```

### `emails.sendTicket`
Enviar bilhete por email
```typescript
Input: {
  ticketId: string;
  email: string;
}
Output: { success: boolean }
```

### `emails.sendEventReminder`
Enviar lembrete de evento
```typescript
Input: {
  userId: string;
  eventId: string;
}
Output: { success: boolean }
```

---

## 📝 Response Codes

- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `500` - Erro do servidor

## 🔒 Permissões

- **Public** - Qualquer utilizador
- **Authenticated** - Utilizador autenticado
- **Promoter** - Apenas promotores aprovados
- **Admin** - Apenas administradores

## 📌 Notas

- Todas as datas devem estar em formato ISO 8601
- Todos os campos JSON string devem ser válidos JSON
- IDs são strings únicas geradas automaticamente
- Paginação: use limit e offset para controlar resultados
