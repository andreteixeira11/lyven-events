# Backend Login Fix Summary

## Problema Identificado

O erro "JSON Parse error: Unexpected character: <" ocorre quando o frontend tenta fazer uma requisição ao backend via tRPC, mas recebe HTML ao invés de JSON. Isso geralmente acontece quando:

1. O backend não está configurado corretamente
2. A URL do backend está incorreta
3. O backend está retornando uma página de erro HTML ao invés de uma resposta JSON

## Alterações Realizadas

### 1. **lib/trpc.ts**
- ✅ Atualizado para usar `window.location.origin` como URL base automaticamente
- ✅ Removido o requisito de configurar manualmente `EXPO_PUBLIC_RORK_API_BASE_URL`
- ✅ Agora o cliente detecta automaticamente a URL do backend

### 2. **backend/hono.ts**
- ✅ Configurado CORS com permissões adequadas
- ✅ Adicionado endpoint `/api` para testes
- ✅ Adicionado error handler global para capturar erros do backend

### 3. **backend/trpc/routes/auth/login.ts**
- ✅ Adicionado try-catch para melhor tratamento de erros
- ✅ Melhorados os logs de debug

### 4. **app/login.tsx**
- ✅ Adicionado melhor tratamento de erros
- ✅ Mensagens de erro mais descritivas
- ✅ Logs detalhados para debug (URL, tipo de erro, stack trace)

### 5. **app/test-backend.tsx** (NOVO)
- ✅ Página de testes para verificar conectividade com o backend
- ✅ Testa endpoints: `/`, `/api`, `/api/trpc/auth.login`
- ✅ Mostra respostas detalhadas e diagnósticos

## Como Testar

### Passo 1: Verificar Backend
1. Certifique-se que o backend está rodando
2. O backend deveria inicializar automaticamente quando você inicia o app
3. Verifique os logs do console por mensagens como:
   - `🗄️ Database not found. Creating...` ou `✅ Database already exists`
   - `🌱 Starting database seeding...`
   - `✅ Test promoter auth created/updated - Email: teste, Password: teste`

### Passo 2: Usar a Página de Teste
1. Navegue para `/test-backend` no navegador
2. Execute os testes na ordem:
   - **Teste 1: Ver URLs** - Mostra as URLs sendo usadas
   - **Teste 2: Testar /** - Verifica se o backend responde
   - **Teste 3: Testar /api** - Verifica o endpoint API
   - **Teste 4: Testar tRPC Login** - Testa o login do promotor

### Passo 3: Testar Login
1. Vá para a página de login
2. Selecione "Promotor"
3. Use as credenciais:
   - **Email**: `teste`
   - **Password**: `teste`
4. Clique em "Entrar"
5. Verifique os logs no console

## Credenciais de Teste

### Promotor
- **Email**: `teste`
- **Password**: `teste`

### Administrador
- **Email**: `admin`
- **Password**: `admin`

## Logs Esperados

### Backend (Console do Servidor)
```
✅ Database already exists
🌱 Starting database seeding...
✅ Test promoter user created/updated: teste
✅ Test promoter auth created/updated - Email: teste, Password: teste
✅ Test promoter profile created/updated
```

### Frontend (Login Bem Sucedido)
```
🔐 Tentando login de promotor...
Email: teste
Base URL: http://localhost:19006
API URL: http://localhost:19006/api/trpc
✅ Login bem sucedido: { success: true, user: {...} }
```

### Frontend (Erro de Conexão)
```
❌ Erro no login: TRPCClientError: JSON Parse error: Unexpected character: <
❌ Tipo do erro: Error
```

## Troubleshooting

### Se ainda receber "JSON Parse error"

1. **Verifique se o backend está rodando**:
   - Procure por logs no console do terminal
   - Teste manualmente: abra `http://localhost:19006/api` no navegador

2. **Limpe o cache**:
   - Pare o servidor
   - Delete a pasta `.expo` e `node_modules/.cache`
   - Reinicie o servidor

3. **Verifique a base de dados**:
   - Procure pelo arquivo `events.db` na raiz do projeto
   - Se necessário, delete-o para forçar a recriação
   - Ou execute: `bun run backend/db/reset-and-seed.ts`

4. **Use a página de teste**:
   - Acesse `/test-backend` e execute todos os testes
   - Isso ajudará a identificar exatamente onde está o problema

### Se o promotor não existir na base de dados

Execute manualmente:
```bash
bun run backend/db/reset-and-seed.ts
```

Isso irá:
- Recriar a tabela `promoter_auth`
- Adicionar o utilizador de teste
- Verificar os dados na base de dados

## Próximos Passos

Uma vez que o login estiver funcionando:

1. ✅ Login de promotor
2. ⏳ Dashboard do promotor com tabs (dashboard, criar evento, perfil)
3. ⏳ Criar eventos
4. ⏳ Gestão de eventos

## Notas Importantes

- O backend do Rork roda automaticamente quando você inicia o app
- A base de dados SQLite (`events.db`) é criada automaticamente
- Os dados de seed são inseridos apenas na primeira execução
- Se você fizer alterações no schema, pode precisar deletar `events.db` para forçar a recriação
