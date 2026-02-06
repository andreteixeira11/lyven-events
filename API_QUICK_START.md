# 🚀 Quick Start - API Lyven

## Começar em 5 Minutos

### 1️⃣ Obter Credenciais

Para começar a usar a API, necessita de um **User ID**:

```javascript
// Criar utilizador (guarde o ID retornado)
const response = await fetch('https://lyven.app/api/trpc/users.create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Meu Promotor',
    email: 'promotor@example.com',
    userType: 'promoter',
    interests: ['music'],
    preferences: {
      notifications: true,
      language: 'pt',
      priceRange: { min: 0, max: 100 },
      eventTypes: ['music']
    }
  })
});

const data = await response.json();
const userId = data.result.data.id;
console.log('Seu User ID:', userId);
```

---

### 2️⃣ Criar um Evento

```javascript
const evento = {
  title: 'Concerto de Rock',
  artists: JSON.stringify([
    {
      id: 'artist_1',
      name: 'Banda XYZ',
      genre: 'Rock',
      image: 'https://example.com/banda.jpg'
    }
  ]),
  venueName: 'Casa da Música',
  venueAddress: 'Av. da Boavista, 604-610',
  venueCity: 'Porto',
  venueCapacity: 1200,
  date: '2025-06-15T21:00:00.000Z',
  image: 'https://example.com/concerto.jpg',
  description: 'Uma noite memorável de rock',
  category: 'music',
  ticketTypes: JSON.stringify([
    {
      id: 'vip',
      name: 'VIP',
      price: 50,
      available: 100,
      maxPerPerson: 4
    },
    {
      id: 'normal',
      name: 'Normal',
      price: 30,
      available: 500,
      maxPerPerson: 6
    }
  ]),
  promoterId: userId, // Use o User ID obtido acima
  tags: JSON.stringify(['rock', 'porto', 'música ao vivo']),
  latitude: 41.1579,
  longitude: -8.6291
};

const response = await fetch('https://lyven.app/api/trpc/events.create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(evento)
});

const data = await response.json();
console.log('Evento criado:', data.result.data.id);
console.log('Status:', data.result.data.status); // 'pending' - aguarda aprovação
```

---

### 3️⃣ Listar Eventos

```javascript
const response = await fetch('https://lyven.app/api/trpc/events.list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    limit: 10,
    offset: 0,
    category: 'music'
  })
});

const data = await response.json();
const eventos = data.result.data.events;

eventos.forEach(evento => {
  console.log(`${evento.title} - ${new Date(evento.date).toLocaleDateString()}`);
});
```

---

## 🎯 Casos de Uso Rápidos

### Aprovar Evento (Admin)

```javascript
await fetch('https://lyven.app/api/trpc/events.approve', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'admin_user_id'
  },
  body: JSON.stringify({ id: 'event_123' })
});
```

---

### Validar Bilhete (Scanner)

```javascript
const response = await fetch('https://lyven.app/api/trpc/tickets.validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qrCode: 'TICKET_ABC123' })
});

const data = await response.json();
const { valid, ticket, event, message } = data.result.data;

if (valid) {
  console.log(`✅ Bilhete válido para ${event.title}`);
} else {
  console.log(`❌ ${message}`);
}
```

---

### Obter Analytics (Admin)

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

console.log('📊 Estatísticas:');
console.log(`- Utilizadores: ${stats.totalUsers}`);
console.log(`- Eventos: ${stats.totalEvents}`);
console.log(`- Bilhetes: ${stats.totalTicketsSold}`);
console.log(`- Receita: ${stats.totalRevenue}€`);
```

---

## 🛠️ Ferramentas Úteis

### Postman Collection
Importe a collection completa:
```
backend/postman-collection.json
```

### OpenAPI/Swagger
Especificação completa em:
```
backend/openapi.json
```

---

## 📖 Próximos Passos

1. ✅ **Criou primeiro evento** → [Ver Guia de Integração Completo](./EXTERNAL_API_INTEGRATION_GUIDE.md)
2. 🔐 **Implementar autenticação** → [Ver Documentação de Auth](./API_COMPLETE_DOCUMENTATION.md#auth)
3. 🎫 **Integrar sistema de bilhetes** → [Ver Documentação de Tickets](./API_COMPLETE_DOCUMENTATION.md#tickets)
4. 📊 **Adicionar analytics** → [Ver Documentação de Analytics](./API_COMPLETE_DOCUMENTATION.md#analytics)
5. 🔔 **Configurar webhooks** → [Ver Exemplos de Webhooks](./WEBHOOK_EXAMPLES.md)

---

## 🆘 Ajuda Rápida

### Erros Comuns

**Erro: "Event not found"**
```javascript
// Certifique-se de usar o ID correto
{ id: 'event_123' } // ✅ Correto
{ eventId: 'event_123' } // ❌ Errado
```

**Erro: "Unauthorized"**
```javascript
// Adicione o header X-User-Id para operações admin
headers: {
  'X-User-Id': 'admin_user_id' // ✅ Necessário para admin
}
```

**Erro: "Invalid JSON"**
```javascript
// Campos como artists e ticketTypes devem ser strings JSON
artists: JSON.stringify([...]) // ✅ Correto
artists: [...] // ❌ Errado
```

---

## 🔗 Links Úteis

- 📚 [Documentação Completa](./API_COMPLETE_DOCUMENTATION.md)
- 🌐 [Guia de Integração Externa](./EXTERNAL_API_INTEGRATION_GUIDE.md)
- 📮 [Collection Postman](./backend/postman-collection.json)
- 🔧 [Especificação OpenAPI](./backend/openapi.json)
- 🎣 [Exemplos Webhooks](./WEBHOOK_EXAMPLES.md)

---

## 💬 Suporte

- **Email**: support@lyven.app
- **Documentação**: https://docs.lyven.app
- **Status**: https://status.lyven.app

---

**Pronto para começar? Copie os exemplos acima e adapte ao seu caso de uso!** 🚀
