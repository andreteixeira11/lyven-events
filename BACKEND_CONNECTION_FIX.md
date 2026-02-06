# Backend Connection Fix - Resolução do Erro 404

## Problema Identificado

O erro 404 indica que o backend não está acessível na URL configurada:
- URL Base: `https://ghz3v5lbclgp2ao2vvlsf.rork.live`
- Erro: Backend retornou 404 em `/api/health`

## Correções Implementadas

### 1. Backend - Endpoints de Health Check Melhorados

Adicionamos múltiplos endpoints de health check no `backend/hono.ts`:

```typescript
// Endpoint principal
app.get("/api/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/api/health",
      test: "/api/test-login"
    }
  });
});

// Endpoint alternativo
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Backend is running",
    timestamp: new Date().toISOString() 
  });
});
```

### 2. Admin Login - Melhor Tratamento de Erros

O `app/admin-login.tsx` agora testa múltiplas URLs antes de falhar:

```typescript
const healthUrls = [
  `${baseUrl}/api/health`,
  `${baseUrl}/health`,
  `${baseUrl}/api`,
  `${baseUrl}/`,
];
```

E fornece informações detalhadas sobre o erro:
- URL testada
- Status code
- Headers da resposta
- Detalhes do erro

### 3. Página de Diagnóstico do Backend

Nova página: `app/backend-diagnostics.tsx`

Testa sistematicamente:
- ✅ Configuração da Base URL
- ✅ Todos os endpoints disponíveis
- ✅ Conectividade do backend
- ✅ Estado da base de dados

Acessível através do botão "Diagnóstico do Backend" na tela de login de admin.

## Como Resolver o Erro 404

### Opção 1: Verificar se o Backend está a Correr

1. Certifique-se de que o backend está a correr na URL correta
2. Verifique os logs do backend para confirmar que está ativo
3. Teste manualmente acessando: `https://ghz3v5lbclgp2ao2vvlsf.rork.live/api/health`

### Opção 2: Verificar Configuração da URL

1. Confirme que `EXPO_PUBLIC_RORK_API_BASE_URL` está configurado corretamente
2. No ambiente web, a URL deve apontar para o domínio correto
3. Verifique se há proxy ou load balancer entre a aplicação e o backend

### Opção 3: Usar a Página de Diagnóstico

1. Acesse a tela de admin login
2. Clique em "Diagnóstico do Backend"
3. Veja os resultados detalhados dos testes
4. Use as informações para identificar o problema específico

## Credenciais de Admin Configuradas

As credenciais do administrador já estão configuradas no seed:

```
Email: geral@lyven.pt
Password: Lyven12345678
```

## Próximos Passos

1. Execute o diagnóstico do backend para identificar o problema específico
2. Verifique os logs do servidor backend
3. Confirme que o backend está acessível na rede
4. Teste o login após confirmar que o backend está respondendo

## Logs Úteis para Debugging

O admin login agora imprime logs detalhados:
- 🌐 Base URL configurada
- 📍 URLs testadas
- 📊 Status codes recebidos
- 📑 Headers das respostas
- ❌ Erros detalhados

Verifique os logs do console para mais informações.

## Comandos Úteis

Se o backend não estiver a correr, você pode precisar:

```bash
# Reiniciar o backend (se aplicável)
bun run backend/hono.ts

# Verificar se a porta está ocupada
lsof -i :3000

# Testar conectividade manualmente
curl https://ghz3v5lbclgp2ao2vvlsf.rork.live/api/health
```

## Estrutura de Endpoints do Backend

```
/                      → Root endpoint
/api                   → API info endpoint  
/api/health            → Health check (principal)
/health                → Health check (alternativo)
/api/trpc/*            → tRPC endpoints
/api/test-login        → Endpoint de teste
```

Todos os endpoints devem retornar status 200 quando o backend está operacional.
