# Setup do Login de Administrador

## Problema Identificado

O utilizador admin não estava a conseguir fazer login com as credenciais:
- **Username:** admin
- **Password:** Lyven12345678

## Causa

O utilizador admin pode não ter sido criado corretamente na base de dados durante o processo de seed inicial.

## Solução

### Opção 1: Usar a Página de Seed (Recomendado)

1. Aceda à URL: `/seed-admin`
2. Clique no botão "Criar Admin"
3. Aguarde a confirmação de sucesso
4. Tente fazer login novamente em `/admin-login`

### Opção 2: Executar Script Manualmente

Se tiver acesso ao terminal:

```bash
bun backend/db/seed-admin.ts
```

### Opção 3: Verificar e Corrigir Manualmente

Se ambas as opções acima falharem, você pode usar o seguinte código SQL diretamente na base de dados:

```sql
-- Inserir utilizador admin
INSERT OR REPLACE INTO users (
  id, name, email, user_type, interests,
  preferences_notifications, preferences_language,
  preferences_price_min, preferences_price_max,
  preferences_event_types, favorite_events, event_history,
  is_onboarding_complete
) VALUES (
  'user-admin-1', 
  'Administrador', 
  'admin', 
  'admin', 
  '[]',
  1, 
  'pt', 
  0, 
  1000, 
  '[]', 
  '[]', 
  '[]',
  1
);

-- Inserir credenciais de autenticação
INSERT OR REPLACE INTO promoter_auth (
  id, email, password, user_id
) VALUES (
  'auth-admin-1',
  'admin',
  'Lyven12345678',
  'user-admin-1'
);
```

## Credenciais de Login

Após executar qualquer uma das soluções acima:

- **URL:** `/admin-login`
- **Username:** admin
- **Password:** Lyven12345678

## Como Acessar o Login de Admin

1. Na tela de login inicial, clique **5 vezes** no logo da aplicação
2. Será redirecionado automaticamente para `/admin-login`
3. Insira as credenciais acima

## Verificação

Para verificar se o admin foi criado corretamente, você pode:

1. Acessar a página `/seed-admin`
2. Os logs mostrarão se o utilizador já existe ou foi criado
3. O sistema mostrará os dados do admin user e auth

## Debug

Se ainda assim não conseguir fazer login, verifique:

1. Os logs do servidor no console (procure por mensagens com prefixo `[LOGIN]`)
2. Se a senha está exatamente como: `Lyven12345678` (com letra maiúscula no L)
3. Se o username é exatamente: `admin` (minúsculas)

## Utilizadores de Teste Disponíveis

Além do admin, existem os seguintes utilizadores de teste:

### Promotor de Teste
- **Username:** teste
- **Password:** teste
- **Tipo:** Promotor
- **Login em:** `/login` (escolher opção "Promotor")
