# 🚀 Guia de Integração Turso

## ✅ O que já está feito

Já atualizei automaticamente:
- ✅ `backend/db/index.ts` - Usa Turso em vez de SQLite local
- ✅ `backend/db/migrate.ts` - Migrations para Turso
- ✅ `.gitignore` - Para proteger o ficheiro `.env`
- ✅ `.env.example` - Template com as variáveis necessárias

---

## 📋 Passos de Configuração

### 1️⃣ Instalar o Cliente Turso (no teu computador)

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm get.tur.so/install.ps1 | iex
```

### 2️⃣ Fazer Login no Turso

```bash
turso auth login
```

### 3️⃣ Criar a Base de Dados

```bash
# Criar a base de dados
turso db create lyven-events

# Verificar que foi criada
turso db list
```

### 4️⃣ Obter as Credenciais

```bash
# Obter o URL da base de dados
turso db show lyven-events --url

# Criar um token de autenticação
turso db tokens create lyven-events
```

**IMPORTANTE**: Guarda estes valores:
- `TURSO_DATABASE_URL` - URL que aparece do comando `show --url`
- `TURSO_AUTH_TOKEN` - Token que aparece do comando `tokens create`

### 5️⃣ Instalar o Pacote @libsql/client

```bash
bun add @libsql/client
```

### 6️⃣ Criar Arquivo .env

Cria um ficheiro `.env` na raiz do projeto:

```env
TURSO_DATABASE_URL=libsql://[nome-da-db]-[org].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

**Cola os valores reais** que obtiveste nos passos 3 e 4!

### 7️⃣ Executar Migrations

Depois de configurar, executa:

```bash
# Vai criar todas as tabelas no Turso
bun backend/db/migrate.ts
```

### 8️⃣ Seed da Base de Dados (Opcional)

```bash
# Criar dados de exemplo
bun backend/db/seed.ts

# Criar admin
bun backend/db/seed-admin.ts

# Criar user normal
bun backend/db/seed-normal-user.ts
```

---

## 🌟 Vantagens do Turso

✅ **SQLite na Cloud** - Base de dados distribuída globalmente  
✅ **Sem Cold Starts** - Sempre rápida  
✅ **Free Tier Generoso**:
- 500 databases
- 9GB de armazenamento total
- 1B de rows lidas/mês

✅ **Replicação Automática** - Dados em múltiplas regiões  
✅ **Compatible com SQLite** - Usa o mesmo schema e queries

---

## 🔄 Para Produção

Quando fizeres deploy:

1. Cria uma nova database para produção:
```bash
turso db create lyven-events-prod
```

2. Obtem as credenciais de produção
3. Adiciona as env vars no servidor de produção
4. Executa as migrations no servidor

---

## 📊 Monitorização

```bash
# Ver estatísticas
turso db show lyven-events

# Ver logs
turso db shell lyven-events
```

---

## 🆘 Troubleshooting

**Erro de conexão?**
- Verifica se o URL e token estão corretos no `.env`
- Testa a conexão: `turso db shell lyven-events`

**Migrations falharam?**
- Verifica se as tabelas já existem
- Podes fazer drop: `turso db shell lyven-events` e depois `DROP TABLE nome_tabela;`
