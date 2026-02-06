# Fix do Login de Promotor

## Problema Identificado
A tabela `promoter_auth` não estava a ser criada no script de migração inicial.

## Solução Aplicada

### 1. Atualizado `backend/db/migrate.ts`
Adicionada a criação da tabela `promoter_auth`:

```sql
CREATE TABLE IF NOT EXISTS promoter_auth (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Criado script `backend/db/reset-and-seed.ts`
Este script:
- Apaga e recria a tabela `promoter_auth`
- Insere/atualiza o utilizador promotor de teste
- Verifica se os dados foram inseridos corretamente

## Como Resolver

### Passo 1: Apagar a base de dados existente
```bash
rm events.db
```

### Passo 2: Recriar a base de dados
```bash
bun run backend/db/migrate.ts
```

### Passo 3: Popular com dados de teste
```bash
bun run backend/db/seed.ts
```

OU executar tudo de uma vez:
```bash
bun run backend/db/reset-and-seed.ts
```

## Credenciais de Login do Promotor

**Email:** teste  
**Password:** teste  
**Tipo de utilizador:** Promotor

## Verificar o Backend

### Ver logs do backend
Os logs devem mostrar:
```
✅ Test promoter user created/exists: teste
✅ Test promoter auth created/exists - Email: teste, Password: teste
✅ Test promoter profile created/exists
```

### Testar no frontend
1. Abrir a app
2. Ir para a tela de login
3. Selecionar "Promotor"
4. Inserir:
   - Email: `teste`
   - Password: `teste`
5. Clicar em "Entrar"

### Logs esperados no login
No console do backend:
```
🔐 Backend: Tentando autenticar: teste
📋 Registos de auth encontrados: 1
🔑 Verificando palavra-passe...
✅ Palavra-passe correta, buscando utilizador...
👤 Utilizadores encontrados: 1
✅ Login bem sucedido para: teste
```

No console do frontend:
```
🔐 Tentando login de promotor...
Email: teste
✅ Login bem sucedido: { success: true, user: {...} }
🔄 Atualizando utilizador: {...}
```

## Estrutura Completa do Backend

### Tabelas necessárias:
1. `users` - Utilizadores (normal e promoter)
2. `promoter_auth` - Autenticação de promotores
3. `promoter_profiles` - Perfis de promotores
4. `promoters` - Dados públicos dos promotores

### Fluxo de autenticação:
1. Utilizador insere email e password
2. Backend procura em `promoter_auth` pelo email
3. Verifica a password
4. Busca o utilizador correspondente em `users`
5. Retorna os dados do utilizador
6. Frontend guarda o utilizador no contexto e AsyncStorage

## Troubleshooting

### Erro: "Credenciais inválidas"
- Verificar se a tabela `promoter_auth` existe
- Verificar se o utilizador foi criado no seed
- Executar `bun run backend/db/reset-and-seed.ts`

### Erro: "Utilizador não encontrado"
- Verificar se o utilizador existe na tabela `users`
- Verificar se o `userId` em `promoter_auth` corresponde ao `id` em `users`

### Base de dados vazia
- Apagar `events.db`
- Executar `bun run backend/db/migrate.ts`
- Executar `bun run backend/db/seed.ts`
