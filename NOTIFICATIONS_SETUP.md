# Sistema de Notificações Push - Configuração Completa

## ✅ Implementação Concluída

O sistema de notificações push foi configurado com sucesso para promotores. As notificações são enviadas automaticamente nos seguintes casos:

### 📢 Eventos que Acionam Notificações

1. **Aprovação de Evento** 🎉
   - Quando um evento é aprovado pelo admin
   - Título: "Evento Aprovado! 🎉"
   - Mensagem: "O seu evento '[Nome do Evento]' foi aprovado e está agora publicado."

2. **Aprovação de Anúncio** 📢
   - Quando um anúncio é aprovado pelo admin
   - Título: "Anúncio Aprovado! 📢"
   - Mensagem: "O seu anúncio '[Nome do Anúncio]' foi aprovado e está agora ativo."

3. **Venda de Bilhete** 🎫
   - Quando um bilhete é vendido para um evento do promotor
   - Título: "Novo Bilhete Vendido! 🎫"
   - Mensagem: "[Quantidade] bilhete(s) vendido(s) para '[Nome do Evento]' - €[Preço]"

## 🔧 Arquitetura

### Backend
- **Schema da Base de Dados** (`backend/db/schema.ts`)
  - Tabela `pushTokens`: Armazena tokens de dispositivos
  - Tabela `notifications`: Histórico de notificações

- **Procedures tRPC** (`backend/trpc/routes/notifications/`)
  - `registerToken`: Registrar token de dispositivo
  - `send`: Enviar notificação push
  - `list`: Listar notificações do usuário
  - `markRead`: Marcar notificação como lida

- **Funções Helper** (`backend/lib/send-notification.ts`)
  - `sendNotification()`: Função reutilizável para enviar notificações

- **Integração com Fluxos Existentes**
  - `backend/trpc/routes/events/approve.ts`: Notifica ao aprovar evento
  - `backend/trpc/routes/advertisements/approve.ts`: Notifica ao aprovar anúncio
  - `backend/trpc/routes/tickets/create.ts`: Notifica ao vender bilhete

### Frontend
- **Context Hook** (`hooks/notifications-context.tsx`)
  - Registra token de notificação
  - Escuta notificações recebidas
  - Gerencia permissões
  - Atualiza lista de notificações

- **Inicialização** (`app/_layout.tsx`)
  - NotificationsContext envolvendo toda a aplicação
  - Inicialização automática ao carregar o app

## 📱 Como Testar

### 1. Testar em Dispositivo Físico
```bash
# Iniciar o app
bun start

# Escanear o QR code com Expo Go no seu dispositivo
```

### 2. Aprovar um Evento (Admin)
```typescript
// Usar o procedimento tRPC
await trpcClient.events.approve.mutate({ 
  eventId: 'evt_...' 
});
```

### 3. Aprovar um Anúncio (Admin)
```typescript
await trpcClient.advertisements.approve.mutate({ 
  adId: 'ad_...' 
});
```

### 4. Criar um Bilhete (Compra)
```typescript
await trpcClient.tickets.create.mutate({
  id: 'ticket_...',
  eventId: 'evt_...',
  userId: 'usr_...',
  ticketTypeId: 'ticket_1',
  quantity: 2,
  price: 50.00,
  qrCode: 'QR_CODE_DATA',
  validUntil: '2025-12-31T23:59:59',
});
```

## 🔐 Permissões Necessárias

### iOS
- Permissão de notificações é solicitada automaticamente
- Configurada em `hooks/notifications-context.tsx`

### Android
- Canal de notificação padrão criado automaticamente
- Configuração de importância, vibração e luz

### Web
- Notificações não são totalmente suportadas
- O sistema funciona mas não envia push notifications reais no browser

## 🛠 Configuração do Expo

O projeto já está configurado com:
- `projectId`: 'hfa30k1ymcso2y545gvqm'
- `expo-notifications`: v0.32.12
- `expo-device`: v8.0.9

## 📊 Banco de Dados

### Tabelas Criadas

**pushTokens**
- id: ID único
- userId: Referência ao usuário
- token: Token Expo Push
- platform: ios | android | web
- isActive: Boolean
- createdAt: Timestamp
- lastUsed: Timestamp

**notifications**
- id: ID único
- userId: Referência ao usuário
- type: Tipo de notificação
- title: Título
- message: Mensagem
- data: JSON com dados extras
- isRead: Boolean
- createdAt: Timestamp

## 🚀 Próximos Passos

Para usar o sistema:

1. ✅ O código já está implementado
2. ✅ As notificações são enviadas automaticamente
3. ⚠️ Precisa executar migrations da base de dados:
   ```bash
   # Se estiver usando Drizzle ORM
   bun drizzle-kit push
   ```
4. 📱 Testar em dispositivo físico (notificações push não funcionam no simulador)
5. 🔍 Verificar logs do console para confirmar envio

## 📝 Notas Importantes

- **Dispositivos Físicos**: Notificações push só funcionam em dispositivos físicos, não em simuladores
- **Expo Go**: Usa os servidores de push da Expo automaticamente
- **Tokens**: São registrados automaticamente quando o usuário abre o app
- **Web**: Limitações de notificações push no browser
