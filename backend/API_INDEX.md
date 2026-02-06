# Lyven App - API Index

## 📊 Estatísticas das APIs

Total de endpoints: **81 APIs**

### Por Categoria:
- **Users**: 6 endpoints
- **Promoters**: 9 endpoints  
- **Events**: 12 endpoints
- **Tickets**: 9 endpoints
- **Advertisements**: 10 endpoints
- **Notifications**: 4 endpoints
- **Analytics**: 5 endpoints
- **Social**: 5 endpoints
- **Auth**: 1 endpoint
- **Emails**: 1 endpoint
- **Webhooks**: 1 endpoint
- **Example**: 1 endpoint

---

## 📁 Estrutura de Arquivos

```
backend/trpc/routes/
├── analytics/
│   ├── dashboard.ts          → analytics.dashboard
│   ├── events.ts             → analytics.events
│   ├── promoters.ts          → analytics.promoters
│   ├── revenue.ts            → analytics.revenue
│   └── users.ts              → analytics.users
│
├── advertisements/
│   ├── create.ts             → advertisements.create
│   ├── get.ts                → advertisements.get
│   ├── update.ts             → advertisements.update
│   ├── delete.ts             → advertisements.delete
│   ├── list.ts               → advertisements.list
│   ├── list-pending.ts       → advertisements.listPending
│   ├── approve.ts            → advertisements.approve
│   ├── record-impression.ts  → advertisements.recordImpression
│   ├── record-click.ts       → advertisements.recordClick
│   └── stats.ts              → advertisements.stats
│
├── auth/
│   └── login.ts              → auth.login
│
├── emails/
│   └── test.ts               → emails.sendTest
│
├── events/
│   ├── create.ts             → events.create
│   ├── get.ts                → events.get
│   ├── update.ts             → events.update
│   ├── delete.ts             → events.delete
│   ├── list.ts               → events.list
│   ├── list-pending.ts       → events.listPending
│   ├── get-pending-details.ts→ events.getPendingDetails
│   ├── approve.ts            → events.approve
│   ├── reject.ts             → events.reject
│   ├── featured.ts           → events.setFeatured
│   └── statistics.ts         → events.statistics
│
├── notifications/
│   ├── register-token.ts     → notifications.registerToken
│   ├── send.ts               → notifications.send
│   ├── list.ts               → notifications.list
│   └── mark-read.ts          → notifications.markRead
│
├── promoters/
│   ├── create.ts             → promoters.create
│   ├── get.ts                → promoters.get
│   ├── update.ts             → promoters.update
│   ├── delete.ts             → promoters.delete
│   ├── list.ts               → promoters.list
│   ├── list-pending.ts       → promoters.listPending
│   ├── approve.ts            → promoters.approve
│   ├── reject.ts             → promoters.reject
│   └── stats.ts              → promoters.stats
│
├── social/
│   ├── follow.ts             → social.follow
│   ├── unfollow.ts           → social.unfollow
│   ├── get-followers.ts      → social.getFollowers
│   ├── get-following.ts      → social.getFollowing
│   └── is-following.ts       → social.isFollowing
│
├── tickets/
│   ├── create.ts             → tickets.create
│   ├── batch-create.ts       → tickets.batchCreate
│   ├── get.ts                → tickets.get
│   ├── list.ts               → tickets.list
│   ├── validate.ts           → tickets.validate
│   ├── cancel.ts             → tickets.cancel
│   ├── transfer.ts           → tickets.transfer
│   ├── add-to-calendar.ts    → tickets.addToCalendar
│   └── set-reminder.ts       → tickets.setReminder
│
├── users/
│   ├── create.ts             → users.create
│   ├── get.ts                → users.get
│   ├── update.ts             → users.update
│   ├── delete.ts             → users.delete
│   ├── list.ts               → users.list
│   └── update-onboarding.ts  → users.updateOnboarding
│
└── webhooks/
    └── create-event.ts       → webhooks.createEvent
```

---

## 🔗 Como Usar as APIs

### No Frontend (React Component):

```typescript
import { trpc } from '@/lib/trpc';

// Exemplo: Listar eventos
const { data, isLoading } = trpc.events.list.useQuery({
  limit: 10,
  offset: 0,
  category: 'music',
});

// Exemplo: Criar evento
const createEvent = trpc.events.create.useMutation();
await createEvent.mutateAsync({
  title: 'Meu Evento',
  // ... outros campos
});
```

### Fora de Componentes React:

```typescript
import { trpcClient } from '@/lib/trpc';

// Exemplo: Obter estatísticas
const stats = await trpcClient.analytics.dashboard.query({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

### Via HTTP (Externo):

```bash
# POST
curl -X POST https://seu-dominio.com/api/trpc/events.create \
  -H "Content-Type: application/json" \
  -d '{"title":"Evento","...":"..."}'

# GET (com query params codificados)
curl https://seu-dominio.com/api/trpc/events.list?input={"limit":10}
```

---

## 📚 Documentação Completa

Para documentação detalhada de cada endpoint (inputs, outputs, exemplos), consulte:
- [API_COMPLETE_DOCUMENTATION.md](../API_COMPLETE_DOCUMENTATION.md)

---

## 🔐 Autenticação

Atualmente as APIs usam `publicProcedure` (sem autenticação obrigatória).

Para implementar autenticação:
1. Edite `backend/trpc/create-context.ts` para extrair userId do header/token
2. Crie `protectedProcedure` que verifica autenticação
3. Substitua `publicProcedure` por `protectedProcedure` nas rotas que necessitam

---

## ✅ Status do Projeto

- ✅ **Users**: Completo
- ✅ **Promoters**: Completo
- ✅ **Events**: Completo
- ✅ **Tickets**: Completo
- ✅ **Advertisements**: Completo
- ✅ **Notifications**: Completo
- ✅ **Analytics**: Completo
- ✅ **Social**: Completo
- ✅ **Auth**: Básico (apenas login)
- ✅ **Emails**: Básico (apenas teste)
- ✅ **Webhooks**: Básico (criar evento)

---

## 🚀 Próximos Passos Recomendados

1. **Segurança**:
   - Implementar autenticação JWT
   - Adicionar rate limiting
   - Validação de permissões por userType

2. **Funcionalidades**:
   - Paginação avançada com cursors
   - Cache com Redis
   - Upload de imagens
   - Processamento de pagamentos

3. **Qualidade**:
   - Testes unitários
   - Testes de integração
   - Logging estruturado
   - Monitorização

4. **Documentação**:
   - Swagger/OpenAPI
   - Postman Collection
   - Guias de integração

---

Última atualização: ${new Date().toISOString().split('T')[0]}
