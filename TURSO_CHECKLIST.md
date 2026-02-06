# ✅ Checklist de Setup do Turso

Usa este checklist para seguir os passos:

## Pré-requisitos
- [ ] Conta criada no Turso (https://turso.tech)
- [ ] Terminal aberto

## Instalação e Setup

### No Terminal:

```bash
# 1. Instalar CLI do Turso
curl -sSfL https://get.tur.so/install.sh | bash
# (Windows: irm get.tur.so/install.ps1 | iex)

# 2. Login
turso auth login

# 3. Criar base de dados
turso db create lyven-events

# 4. Obter URL (COPIA ESTE VALOR!)
turso db show lyven-events --url

# 5. Criar token (COPIA ESTE VALOR!)
turso db tokens create lyven-events

# 6. Instalar cliente
bun add @libsql/client
```

### No Projeto:

- [ ] Criar ficheiro `.env` na raiz com:
```env
TURSO_DATABASE_URL=<cola o URL aqui>
TURSO_AUTH_TOKEN=<cola o token aqui>
```

- [ ] Executar migrations:
```bash
bun backend/db/migrate.ts
```

- [ ] Fazer seed (opcional):
```bash
bun backend/db/seed.ts
```

## Testar

- [ ] Iniciar a app: `bun start`
- [ ] Fazer login com: `teste` / `teste`
- [ ] Verificar se eventos aparecem

## ✅ Pronto!

Agora a tua app está usando Turso! 🎉

**Para produção**, repete os passos mas cria uma base de dados chamada `lyven-events-prod`.
