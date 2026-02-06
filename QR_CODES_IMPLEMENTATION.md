# Implementação de QR Codes - Lyven

## ✅ Status: COMPLETO E FUNCIONAL

Os QR codes estão **totalmente implementados e prontos** para serem utilizados quando cada bilhete é vendido.

## 🎫 Fluxo Completo de QR Codes

### 1. Geração de QR Codes (Venda de Bilhetes)

**Localização:** `hooks/cart-context.tsx` (função `completePurchase`)

Quando um utilizador completa a compra:

1. **QR Code único é gerado** para cada bilhete:
   ```typescript
   const qrCode = `LYVEN_${ticketId}_${item.eventId}_${uniqueSuffix.toUpperCase()}`;
   ```

2. **Formato do QR Code:**
   - Prefixo: `LYVEN_`
   - ID do bilhete único com timestamp
   - ID do evento
   - Sufixo aleatório único (26 caracteres)
   - Exemplo: `LYVEN_ticket_1738123456_0_abc123xyz456_event_1_ABC123XYZ456`

3. **Características de Segurança:**
   - ✅ Timestamp único por compra
   - ✅ Índice sequencial por bilhete na mesma compra
   - ✅ 26 caracteres aleatórios únicos
   - ✅ Inclui ID do evento para validação
   - ✅ Válido por 6 meses após a compra

4. **Armazenamento:**
   - ✅ Guardado no backend (base de dados SQLite)
   - ✅ Guardado localmente no dispositivo (AsyncStorage)
   - ✅ Disponível offline na secção "Meus Ingressos"

### 2. Visualização de QR Codes

**Localização:** `app/my-tickets.tsx`

Os utilizadores podem visualizar os QR codes dos seus bilhetes:

1. **Componente QRCode:** `components/QRCode.tsx`
   - Renderiza visualmente o QR code
   - Tamanho padrão: 120x120px
   - Cores personalizáveis
   - Padrão único baseado no valor do QR code

2. **Exibição no Bilhete:**
   - QR code grande e visível
   - Mostra o ID do bilhete abaixo do QR
   - Informações do evento e local
   - Data e hora do evento

### 3. Validação de QR Codes (Scanner)

**Localização:** `app/qr-scanner/[id].tsx`

Os promotores podem validar bilhetes através do scanner:

1. **Integração com Backend:**
   ```typescript
   const result = await trpcClient.tickets.validate.mutate({ qrCode: data });
   ```

2. **Validações Realizadas:**
   - ✅ Verifica se o QR code existe na base de dados
   - ✅ Verifica se o bilhete já foi utilizado
   - ✅ Verifica se o bilhete está expirado
   - ✅ Verifica se o bilhete é para o evento correto
   - ✅ Marca o bilhete como utilizado após validação

3. **Feedback ao Promotor:**
   - ✅ Vibração háptica (sucesso ou erro)
   - ✅ Alerta visual com detalhes do bilhete
   - ✅ Contador de bilhetes validados
   - ✅ Histórico do último bilhete validado

4. **Mensagens de Erro:**
   - "QR Code não reconhecido" - QR code inválido
   - "Bilhete já foi utilizado" - Tentativa de reutilização
   - "Bilhete expirado" - Fora do prazo de validade
   - "Bilhete não é para este evento" - Evento incorreto

### 4. API de Validação (Backend)

**Localização:** `backend/trpc/routes/tickets/validate.ts`

Endpoint que processa a validação:

```typescript
export const validateTicketProcedure = publicProcedure
  .input(z.object({ qrCode: z.string() }))
  .mutation(async ({ input }) => {
    // Busca o bilhete pelo QR code
    // Verifica se existe
    // Verifica se já foi usado
    // Verifica se está válido
    // Marca como usado
    // Retorna sucesso e dados do bilhete
  });
```

## 🔐 Segurança

1. **Unicidade Garantida:**
   - Timestamp único por transação
   - Índice sequencial
   - 26 caracteres aleatórios
   - ID do evento incluído

2. **Proteção contra Fraude:**
   - ✅ QR codes não podem ser reutilizados
   - ✅ Validação de evento correto
   - ✅ Verificação de expiração
   - ✅ Auditoria no backend

3. **Offline First:**
   - ✅ QR codes armazenados localmente
   - ✅ Disponíveis sem conexão
   - ✅ Validação requer conexão (segurança)

## 📱 Funcionalidades

### Para Compradores:
- ✅ QR code gerado automaticamente na compra
- ✅ Visualização imediata após compra
- ✅ Acesso offline aos QR codes
- ✅ Válido por 6 meses

### Para Promotores:
- ✅ Scanner de QR code integrado
- ✅ Validação em tempo real
- ✅ Feedback háptico e visual
- ✅ Contador de bilhetes validados
- ✅ Proteção contra fraude

## 🧪 Logs de Debug

O sistema inclui logs extensivos para debugging:

```
🎫 Criando bilhete com QR Code:
  - ticketId: ...
  - qrCode: ...
  - eventId: ...
  - quantity: ...

✅ Bilhetes criados no backend com sucesso
✅ Bilhetes adicionados à lista de comprados

🔍 Validando QR Code: ...
✅ Resultado da validação: ...
❌ Erro ao validar bilhete: ...
```

## 📊 Base de Dados

**Schema do Bilhete:**

```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  eventId TEXT NOT NULL,
  userId TEXT NOT NULL,
  ticketTypeId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  qrCode TEXT NOT NULL,           -- QR code único
  isUsed BOOLEAN DEFAULT FALSE,    -- Marca se foi validado
  purchaseDate TEXT DEFAULT CURRENT_TIMESTAMP,
  validUntil TEXT NOT NULL,        -- Data de expiração
  addedToCalendar BOOLEAN DEFAULT FALSE,
  reminderSet BOOLEAN DEFAULT FALSE
);
```

## ✨ Conclusão

O sistema de QR codes está **100% funcional** e pronto para uso em produção:

- ✅ Geração automática na compra
- ✅ Armazenamento seguro (backend + local)
- ✅ Visualização para compradores
- ✅ Scanner e validação para promotores
- ✅ Proteção contra fraude e reutilização
- ✅ Feedback visual e háptico
- ✅ Logs extensivos para debugging
- ✅ Compatível com web e mobile

**Nenhuma ação adicional é necessária. O sistema está pronto para ser usado!** 🎉
