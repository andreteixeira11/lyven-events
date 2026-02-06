# Guia de Debug - Login de Promotor

## Credenciais de Teste
- **Email**: `teste`
- **Password**: `teste`

## Sistema de Autenticação

### 1. Fluxo de Login
1. Utilizador seleciona tipo "Promotor" no ecrã de login
2. Insere email e password
3. Frontend chama `trpcClient.auth.login.mutate({ email, password })`
4. Backend verifica credenciais na tabela `promoter_auth`
5. Backend busca dados do utilizador na tabela `users`
6. Frontend salva os dados do utilizador no AsyncStorage
7. Redireciona para `/(tabs)` que mostra o dashboard do promotor

### 2. Estrutura da Base de Dados

#### Tabela: `users`
- Armazena dados básicos do utilizador
- Campo `userType`: 'normal' | 'promoter'

#### Tabela: `promoter_auth`
- Armazena credenciais de login dos promotores
- Campos: `email`, `password`, `userId`

#### Tabela: `promoter_profiles`
- Armazena perfil completo do promotor
- Campos: `companyName`, `description`, `website`, etc.

### 3. Utilizador de Teste Criado no Seed

O seed (`backend/db/seed.ts`) cria automaticamente:
```typescript
{
  id: 'user-promoter-teste',
  email: 'teste',
  userType: 'promoter',
  // ... outros campos
}
```

E as credenciais:
```typescript
{
  email: 'teste',
  password: 'teste',
  userId: 'user-promoter-teste'
}
```

### 4. Logs Adicionados

#### Frontend (`app/login.tsx`)
- `🔐 Tentando login de promotor...`
- `✅ Login bem sucedido:`
- `❌ Erro no login:`

#### Backend (`backend/trpc/routes/auth/login.ts`)
- `🔐 Backend: Tentando autenticar:`
- `📋 Registos de auth encontrados:`
- `🔑 Verificando palavra-passe...`
- `✅ Palavra-passe correta, buscando utilizador...`
- `👤 Utilizadores encontrados:`
- `✅ Login bem sucedido para:`

#### UserContext (`hooks/user-context.tsx`)
- `🔄 Atualizando utilizador:`
- `ℹ️ Criando novo utilizador a partir de updates`
- `ℹ️ Atualizando utilizador existente`

### 5. Interface do Promotor

Quando o login é bem sucedido, o promotor vê:
- Tab bar com 3 opções:
  - **Dashboard**: Estatísticas e gestão de eventos
  - **Criar Evento**: Formulário para criar novos eventos
  - **Perfil**: Informações do promotor e configurações

### 6. Verificação da Base de Dados

Para verificar se o utilizador foi criado corretamente, execute:
```bash
# No terminal, na raiz do projeto
sqlite3 events.db "SELECT * FROM users WHERE email = 'teste';"
sqlite3 events.db "SELECT * FROM promoter_auth WHERE email = 'teste';"
```

### 7. Passos para Testar

1. **Verificar se o backend está a correr**
   - O backend inicia automaticamente ao iniciar o projeto
   - Deve ver logs de inicialização da BD

2. **Verificar se o seed foi executado**
   - Procurar por `✅ Test promoter auth created/exists` nos logs

3. **Tentar fazer login**
   - Selecionar tipo "Promotor"
   - Email: `teste`
   - Password: `teste`
   - Clicar em "Entrar"

4. **Verificar logs**
   - Verificar console para ver os logs de autenticação
   - Se aparecer erro, os logs mostrarão exatamente onde falhou

### 8. Possíveis Problemas e Soluções

#### Problema: "Credenciais inválidas"
- **Causa**: Utilizador não foi criado ou password incorreta
- **Solução**: Verificar se o seed foi executado
- **Como verificar**: Consultar BD diretamente (ver passo 6)

#### Problema: "Erro ao processar webhook"
- **Causa**: Este é um erro diferente, relacionado com webhooks
- **Solução**: Ignorar, não afeta o login

#### Problema: Redireciona mas não mostra interface de promotor
- **Causa**: UserType não foi salvo corretamente
- **Solução**: Verificar AsyncStorage e logs do UserContext

#### Problema: Backend não responde
- **Causa**: Backend pode não ter iniciado
- **Solução**: Reiniciar o servidor

### 9. Forçar Recriação da Base de Dados

Se necessário, pode forçar a recriação da BD:
```bash
# Parar o servidor
# Apagar a base de dados
rm events.db
# Reiniciar o servidor - a BD será recriada automaticamente
```

### 10. Debug Adicional

Para ver todos os utilizadores na BD:
```bash
sqlite3 events.db "SELECT id, email, userType FROM users;"
```

Para ver todas as credenciais:
```bash
sqlite3 events.db "SELECT email, userId FROM promoter_auth;"
```

## Contacto para Suporte

Se continuar com problemas após seguir este guia, fornecer:
1. Screenshots dos logs do console
2. Erro exato que aparece
3. Resultado das queries SQL acima
