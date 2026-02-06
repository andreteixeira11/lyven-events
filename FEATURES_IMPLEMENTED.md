# Funcionalidades Implementadas - LYVEN

## ✅ Implementações Completas

### 1. Partilha Social e Deep Links
**Localização**: `lib/share-utils.ts`, `app/event/[id].tsx`

- ✅ Partilha para WhatsApp com mensagem personalizada
- ✅ Partilha para Facebook via web
- ✅ Partilha para Instagram (com cópia de link)
- ✅ Partilha para Twitter/X
- ✅ Copiar link para área de transferência
- ✅ Deep links funcionais usando Expo Linking
- ✅ Suporte nativo para iOS ActionSheet e Android Alert
- ✅ Fallback para web com Navigator.share API
- ✅ Integrado na página de detalhes do evento

**Como usar**:
```typescript
import { shareEvent } from '@/lib/share-utils';

await shareEvent({
  eventId: 'event-123',
  eventTitle: 'Festival de Música',
  platform: 'whatsapp' // ou 'facebook', 'instagram', 'twitter', 'copy'
});
```

---

### 2. Descoberta Inteligente com AI/ML
**Localização**: 
- Backend: `backend/trpc/routes/recommendations/`
- Rotas: `smart` e `ai` em `recommendations`

#### Sistema de Recomendações Inteligentes
- ✅ **Recomendações baseadas em Score**: Analisa interesses, histórico, localização e preferências
- ✅ **Recomendações com AI**: Usa IA generativa (@rork/toolkit-sdk) para recomendações contextuais
- ✅ **Explicações em português**: Cada recomendação vem com motivos claros
- ✅ **Múltiplos critérios de scoring**:
  - Correspondência com interesses (+30 pontos)
  - Histórico de categorias (+20 pontos)
  - Proximidade geográfica (+25 pontos)
  - Eventos em destaque (+15 pontos)
  - Urgência temporal (+10 pontos se acontece em 7 dias)

**Endpoints API**:
```typescript
// Recomendações inteligentes com score
const { recommendations } = await trpc.recommendations.smart.query({
  userId: 'user-123',
  limit: 10,
  includeReasons: true
});

// Recomendações com AI generativa
const { recommendations } = await trpc.recommendations.ai.query({
  userId: 'user-123',
  limit: 5
});
```

**Resposta da API**:
```json
{
  "recommendations": [
    {
      "eventId": "evt-1",
      "score": 85,
      "reasons": [
        "Corresponde aos teus interesses",
        "Perto da tua localização"
      ],
      "rank": 1,
      "basedOn": "interests",
      "event": { /* dados do evento */ }
    }
  ]
}
```

---

### 3. Integração com Calendário
**Localização**: `hooks/calendar-context.tsx`, `app/event/[id].tsx`

- ✅ Adicionar eventos ao calendário nativo
- ✅ Definir lembretes personalizados
- ✅ Integração com expo-calendar
- ✅ Permissões para iOS e Android
- ✅ UI integrada na página de detalhes do evento
- ✅ Estados visuais para eventos já no calendário

**Como funciona**:
- Botões na página do evento para adicionar ao calendário
- Opções de lembrete: 1h, 3h, 1 dia, 3 dias, 1 semana antes
- Sincronização automática com o calendário do dispositivo

---

### 4. Recuperação de Password
**Localização**: `app/forgot-password.tsx`

- ✅ Interface completa para recuperação de password
- ✅ Validação de email
- ✅ Feedback visual de sucesso
- ✅ Design responsivo e acessível
- ✅ Integração com backend (rota: `auth.forgotPassword`)

**Fluxo**:
1. Utilizador insere email
2. Sistema valida formato
3. Envia email com link de recuperação
4. Feedback visual de confirmação

---

### 5. Modo Noturno (Dark Mode)
**Localização**: `hooks/theme-context.tsx`, `app/theme-settings.tsx`

- ✅ **3 modos disponíveis**:
  - Modo Claro (light)
  - Modo Escuro (dark)
  - Automático (segue sistema)
- ✅ Paleta de cores completa para cada modo
- ✅ Persistência da escolha com AsyncStorage
- ✅ Reação automática às mudanças do sistema
- ✅ Interface de configuração dedicada
- ✅ Pré-visualização em tempo real

**Paleta de Cores**:
```typescript
// Modo Claro
{
  primary: '#0099a8',
  background: '#FFFFFF',
  card: '#F0F9FA',
  text: '#000000',
  // ...
}

// Modo Escuro
{
  primary: '#00C4D8',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  // ...
}
```

**Usar o tema**:
```typescript
import { useTheme } from '@/hooks/theme-context';

function MyComponent() {
  const { colors, isDark, changeTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

---

### 6. Modo Offline
**Localização**: `hooks/offline-context.tsx`

- ✅ **Cache de bilhetes**: Guarda QR codes e detalhes offline
- ✅ **Cache de eventos**: Informações essenciais dos eventos
- ✅ **Detecção de conectividade**: Usa NetInfo para monitorizar estado da rede
- ✅ **Expiração automática**: Cache válido por 7 dias
- ✅ **Gestão de storage**: Calculador de tamanho de cache
- ✅ **Limpeza de cache**: Remover dados antigos

**Funcionalidades**:
```typescript
import { useOffline } from '@/hooks/offline-context';

function MyComponent() {
  const {
    isOnline,
    cachedTickets,
    cachedEvents,
    cacheTicket,
    cacheEvent,
    clearCache,
    cacheSize // em KB
  } = useOffline();

  // Guardar bilhete offline
  await cacheTicket({
    id: 'ticket-123',
    eventId: 'event-456',
    qrCode: 'base64...',
    eventTitle: 'Festival',
    eventImage: 'https://...',
    eventDate: '2025-06-01',
    venue: 'Pavilhão',
    quantity: 2
  });

  // Aceder a bilhetes offline
  const offlineTickets = cachedTickets;
}
```

---

## 🔧 Testes Automatizados

### Estrutura Recomendada

#### 1. Unit Tests
**Ferramentas**: Jest + React Native Testing Library

```bash
npm install --save-dev jest @testing-library/react-native
```

**Exemplo de teste**:
```typescript
// __tests__/utils/share-utils.test.ts
import { shareEvent } from '@/lib/share-utils';

describe('shareEvent', () => {
  it('deve criar deep link correto', async () => {
    const result = await shareEvent({
      eventId: 'test-123',
      eventTitle: 'Test Event',
      platform: 'copy'
    });
    expect(result).toBe(true);
  });
});
```

#### 2. Integration Tests
**Ferramentas**: Jest + MSW (Mock Service Worker)

```typescript
// __tests__/integration/recommendations.test.ts
import { trpcClient } from '@/lib/trpc';

describe('Recommendations API', () => {
  it('deve retornar recomendações para utilizador', async () => {
    const result = await trpcClient.recommendations.smart.query({
      userId: 'test-user',
      limit: 5
    });
    
    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });
});
```

#### 3. E2E Tests
**Ferramentas**: Detox

```bash
npm install --save-dev detox
```

```typescript
// e2e/events.e2e.ts
describe('Event Flow', () => {
  it('deve permitir partilhar evento', async () => {
    await element(by.id('event-card-0')).tap();
    await element(by.id('share-button')).tap();
    await element(by.text('WhatsApp')).tap();
    await expect(element(by.text('Partilhado'))).toBeVisible();
  });
});
```

---

## 📊 Analytics Avançados

### Implementação Futura Recomendada

#### 1. Tracking de Eventos
```typescript
// lib/analytics.ts
import Analytics from '@segment/analytics-react-native';

export const trackEvent = (eventName: string, properties?: object) => {
  Analytics.track(eventName, properties);
};

// Uso
trackEvent('event_viewed', {
  event_id: 'evt-123',
  event_title: 'Festival',
  source: 'recommendation'
});
```

#### 2. Heatmaps
**Ferramenta recomendada**: Smartlook ou Hotjar

```typescript
import Smartlook from 'smartlook-react-native-wrapper';

Smartlook.setupAndStartRecording('API_KEY');
```

#### 3. A/B Testing
**Ferramenta recomendada**: Firebase Remote Config

```typescript
import remoteConfig from '@react-native-firebase/remote-config';

const showNewDesign = remoteConfig().getValue('new_design_enabled').asBoolean();
```

#### 4. Funis de Conversão
```typescript
// Definir funil
const purchaseFunnel = [
  'event_viewed',
  'tickets_selected',
  'checkout_started',
  'payment_completed'
];

// Track cada etapa
trackEvent(purchaseFunnel[0], { event_id: 'evt-123' });
```

---

## 🚀 Como Usar as Funcionalidades

### 1. Adicionar Providers ao App
```typescript
// app/_layout.tsx
import { ThemeProvider } from '@/hooks/theme-context';
import { OfflineProvider } from '@/hooks/offline-context';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OfflineProvider>
          <UserProvider>
            {/* Resto da app */}
          </UserProvider>
        </OfflineProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### 2. Navegar para Definições de Tema
```typescript
import { router } from 'expo-router';

router.push('/theme-settings');
```

### 3. Usar Recomendações
```typescript
import { trpc } from '@/lib/trpc';

function RecommendationsScreen() {
  const { data } = trpc.recommendations.smart.useQuery({
    userId: user.id,
    limit: 10
  });

  return (
    <ScrollView>
      {data?.recommendations.map(rec => (
        <EventCard key={rec.eventId} event={rec.event} />
      ))}
    </ScrollView>
  );
}
```

---

## 📝 Notas Importantes

### Permissões Necessárias (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCalendarsUsageDescription": "Para adicionar eventos ao calendário",
        "NSRemindersUsageDescription": "Para definir lembretes"
      }
    },
    "android": {
      "permissions": [
        "READ_CALENDAR",
        "WRITE_CALENDAR",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### Dependências Instaladas
- `expo-sharing` - Partilha de conteúdo
- `expo-clipboard` - Copiar para clipboard
- `@react-native-community/netinfo` - Detecção de conectividade
- Expo modules já existentes: `expo-calendar`, `expo-linking`

---

## 🎯 Próximos Passos Sugeridos

1. **Testes**: Implementar suite completa de testes
2. **Analytics**: Integrar Segment ou Firebase Analytics
3. **A/B Testing**: Setup Firebase Remote Config
4. **Performance**: Implementar React Native Performance Monitor
5. **Crash Reporting**: Integrar Sentry
6. **Push Notifications**: Melhorar sistema existente com deep links
7. **Internacionalização**: Adicionar suporte para EN e outros idiomas
8. **Acessibilidade**: Audit com ferramentas como Axe

---

## 📚 Documentação de Referência

- [Expo Linking](https://docs.expo.dev/guides/linking/)
- [Expo Calendar](https://docs.expo.dev/versions/latest/sdk/calendar/)
- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)
- [tRPC Documentation](https://trpc.io/docs/)
- [@rork/toolkit-sdk](Documentação interna do projeto)

---

**Data de criação**: 29 de Outubro de 2025  
**Versão da App**: 1.0.0  
**Expo SDK**: 54.0.0
