# Guia de Integração - Site para App

## Resumo
A app está agora configurada apenas para utilizadores normais. Promotores **não** podem fazer login na app. Todos os eventos serão criados a partir do **site web do promotor** e sincronizados com a app através da API.

## Mudanças Realizadas

### 1. Onboarding Simplificado
- Removido o passo de seleção de tipo de conta (promotor/normal)
- Todos os novos utilizadores são automaticamente criados como utilizadores normais
- Onboarding focado apenas em interesses, localização e preferências

### 2. Funcionalidades Removidas da App
- Login de promotores
- Dashboard de promotor
- Criação de eventos na app
- Gestão de eventos
- Estatísticas de promotor
- Seguidores de promotor

### 3. Perfil de Utilizador Simplificado
- Removidas todas as opções relacionadas com promotores
- Menu focado apenas em: Favoritos, Histórico, Notificações, Definições, Ajuda

## API para Criar Eventos

### Endpoint
```
POST {baseUrl}/api/trpc/events.create
```

### Formato do Request (tRPC)
```typescript
{
  id: string,                    // ID único do evento
  title: string,                 // Título do evento
  artists: [
    {
      id: string,
      name: string,
      genre: string,
      image: string              // URL da imagem do artista
    }
  ],
  venue: {
    name: string,                // Nome do local
    address: string,             // Morada completa
    city: string,                // Cidade
    capacity: number             // Capacidade do local
  },
  date: string,                  // Data ISO: "2025-03-15T20:00:00.000Z"
  endDate?: string,              // Data de fim (opcional)
  image: string,                 // URL da imagem do evento
  description: string,           // Descrição completa
  category: 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other',
  ticketTypes: [
    {
      id: string,
      name: string,              // Ex: "Plateia", "Balcão"
      price: number,             // Preço em euros
      available: number,         // Quantidade disponível
      description?: string,
      maxPerPerson: number       // Máximo por compra
    }
  ],
  isFeatured?: boolean,          // Evento destacado
  duration?: number,             // Duração em minutos
  promoterId: string,            // ID do promotor
  tags: string[],                // Tags do evento
  socialLinks?: {
    instagram?: string,
    facebook?: string,
    twitter?: string,
    website?: string
  },
  coordinates?: {
    latitude: number,
    longitude: number
  }
}
```

### Exemplo de Request
```typescript
await fetch('{baseUrl}/api/trpc/events.create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'event_' + Date.now(),
    title: 'Arctic Monkeys em Lisboa',
    artists: [
      {
        id: 'artist_1',
        name: 'Arctic Monkeys',
        genre: 'Indie Rock',
        image: 'https://example.com/arctic-monkeys.jpg'
      }
    ],
    venue: {
      name: 'Coliseu dos Recreios',
      address: 'Rua das Portas de Santo Antão, 96',
      city: 'Lisboa',
      capacity: 3000
    },
    date: '2025-03-15T21:00:00.000Z',
    image: 'https://example.com/event-image.jpg',
    description: 'Os Arctic Monkeys regressam a Lisboa...',
    category: 'music',
    ticketTypes: [
      {
        id: 'ticket_1',
        name: 'Plateia',
        price: 45.00,
        available: 150,
        description: 'Lugares sentados na plateia',
        maxPerPerson: 4
      },
      {
        id: 'ticket_2',
        name: 'Balcão',
        price: 35.00,
        available: 200,
        description: 'Lugares no balcão',
        maxPerPerson: 4
      }
    ],
    isFeatured: true,
    duration: 120,
    promoterId: 'promoter_123',
    tags: ['indie rock', 'british', 'alternative'],
    socialLinks: {
      instagram: 'https://instagram.com/arcticmonkeys',
      facebook: 'https://facebook.com/arcticmonkeys'
    },
    coordinates: {
      latitude: 38.7169,
      longitude: -9.1399
    }
  })
});
```

### Response
```json
{
  "result": {
    "data": {
      "id": "event_1737564600000",
      "title": "Arctic Monkeys em Lisboa",
      "status": "pending",
      ...
    }
  }
}
```

## Status dos Eventos
Todos os eventos criados via API ficam com status `pending` e são automaticamente:
1. Enviado email de notificação para o admin
2. Visíveis na app após aprovação do admin
3. Podem ser aprovados no painel de administração da app

## Integração com tRPC (Recomendado)
Se o site usar TypeScript, pode usar o cliente tRPC para type-safety completo:

```typescript
import { trpcClient } from '@/lib/trpc';

const event = await trpcClient.events.create.mutate({
  id: 'event_' + Date.now(),
  title: 'Novo Evento',
  // ... resto dos dados com autocomplete
});
```

## Próximos Passos
1. O site do promotor deve implementar um formulário para criar eventos
2. Ao submeter, fazer request para a API da app
3. Os utilizadores da app verão automaticamente os novos eventos
4. Utilizadores podem comprar bilhetes diretamente na app
5. Promotores gerem tudo a partir do site

## Notas Importantes
- Todos os eventos precisam de aprovação do admin antes de ficarem visíveis
- Os IDs devem ser únicos (recomendamos usar `event_${timestamp}` ou UUID)
- As imagens devem ser URLs públicas e acessíveis
- As datas devem estar no formato ISO 8601
- A categoria deve ser uma das permitidas: 'music', 'theater', 'comedy', 'dance', 'festival', 'other'

## Suporte
Para mais detalhes sobre a API, consulte o arquivo `API_DOCUMENTATION.md`
