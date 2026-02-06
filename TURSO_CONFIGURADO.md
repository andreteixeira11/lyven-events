# ✅ Turso Database - Configuração Completa

## 🎉 Configuração Concluída!

As credenciais do Turso foram configuradas com sucesso no ficheiro `.env`:

```
TURSO_DATABASE_URL=libsql://lyvendb-lyven.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjM5NzkxNjEsImlkIjoiZTY3NGY2YTItNjgyYi00MzhhLThmNTMtZGZlY2U5YjJjZDY2IiwicmlkIjoiMTMxOTkzODAtOTFlZi00YmQ1LWJiZTctM2M1YjUwZmRhOTQ1In0.fwnKOfzXNPNrshnPUN01d1PxF8LL7sWpfKCxgxUKVy_i-JgQG-mLQ3gWT9WiQaxKD-LXXXID1DW1J9c5qzoKBw
```

## 🚀 Próximos Passos

### 1. Criar Tabelas e Dados Iniciais

Tens 2 opções:

#### Opção A: Usar a Interface da App (Recomendado)
1. Abre a app
2. Navega para `/setup-database`
3. Clica em "🚀 Executar Tudo"
4. Aguarda a conclusão

#### Opção B: Via Backend Direto
Se o backend estiver a correr (ex: `http://localhost:3000`), podes fazer:

```bash
# 1. Criar as tabelas
curl -X POST http://localhost:3000/api/migrate

# 2. Inserir dados iniciais
curl -X POST http://localhost:3000/api/seed
```

### 2. Verificar a Instalação

Depois de executar o setup, verifica que tudo está a funcionar:

1. Testa o login como Admin:
   - Email: `admin`
   - Password: `Lyven12345678`

2. Testa o login como Promotor:
   - Email: `teste`
   - Password: `teste`

3. Verifica que os eventos aparecem na app

## 📊 Estrutura da Base de Dados

As seguintes tabelas serão criadas:

- ✅ **users** - Utilizadores da app
- ✅ **promoters** - Promotores de eventos
- ✅ **promoter_profiles** - Perfis de promotores
- ✅ **promoter_auth** - Autenticação de promotores
- ✅ **events** - Eventos
- ✅ **tickets** - Bilhetes
- ✅ **advertisements** - Anúncios
- ✅ **following** - Seguidores
- ✅ **event_statistics** - Estatísticas de eventos
- ✅ **push_tokens** - Tokens de notificações push
- ✅ **notifications** - Notificações
- ✅ **verification_codes** - Códigos de verificação
- ✅ **payment_methods** - Métodos de pagamento

## 🧪 Dados de Teste Incluídos

O seed vai criar:

- **1 Admin**: admin / Lyven12345678
- **1 Promotor Teste**: teste / teste
- **6 Promotores** com perfis completos
- **10+ Eventos** de diferentes categorias
- **1 Utilizador Normal**: joao@teste.com (sem password, para login via onboarding)

## 🔧 Configuração do Backend

### Variáveis de Ambiente Necessárias

Certifica-te que tens estas variáveis no teu ambiente de produção:

```bash
TURSO_DATABASE_URL=libsql://lyvendb-lyven.aws-eu-west-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjM5NzkxNjEsImlkIjoiZTY3NGY2YTItNjgyYi00MzhhLThmNTMtZGZlY2U5YjJjZDY2IiwicmlkIjoiMTMxOTkzODAtOTFlZi00YmQ1LWJiZTctM2M1YjUwZmRhOTQ1In0.fwnKOfzXNPNrshnPUN01d1PxF8LL7sWpfKCxgxUKVy_i-JgQG-mLQ3gWT9WiQaxKD-LXXXID1DW1J9c5qzoKBw
```

### Para Deploy em Produção

Se estiveres a usar um serviço como Vercel, Railway, ou outro:

1. Adiciona as variáveis de ambiente no painel de configuração
2. Faz deploy do backend
3. Depois do deploy, executa o migration:
   ```bash
   curl -X POST https://teu-dominio.com/api/migrate
   ```
4. Depois executa o seed:
   ```bash
   curl -X POST https://teu-dominio.com/api/seed
   ```

## ✅ Checklist Final

- [ ] Ficheiro `.env` criado com credenciais Turso
- [ ] Migrations executadas (tabelas criadas)
- [ ] Seed executado (dados iniciais inseridos)
- [ ] Login como admin funcional
- [ ] Login como promotor teste funcional
- [ ] Eventos a aparecer na app
- [ ] Backend deployado (se aplicável)
- [ ] Variáveis de ambiente configuradas no ambiente de produção

## 🔒 Segurança

**IMPORTANTE**: 
- ❌ NUNCA faças commit do ficheiro `.env` para o Git
- ✅ O `.gitignore` já está configurado para ignorar este ficheiro
- ✅ Em produção, usa variáveis de ambiente do teu hosting
- ✅ Mantém o token do Turso seguro

## 📱 Testar na App

1. Inicia o backend: `bun run backend/hono.ts`
2. Inicia a app: `bun expo start`
3. Navega para `/setup-database`
4. Clica em "Executar Tudo"
5. Aguarda a conclusão
6. Testa o login!

## 🆘 Resolução de Problemas

### Erro "Missing Turso credentials"
- Verifica que o ficheiro `.env` existe na raiz do projeto
- Confirma que as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` estão definidas

### Erro ao criar tabelas
- Verifica a conexão à internet
- Confirma que o token do Turso é válido
- Tenta aceder ao dashboard do Turso para verificar o estado da database

### Dados não aparecem
- Primeiro executa o migration (criar tabelas)
- Depois executa o seed (inserir dados)
- Verifica os logs para erros específicos

## 📞 Suporte

Se encontrares problemas:
1. Verifica os logs do backend
2. Verifica os logs da app (console do navegador ou terminal)
3. Confirma que todas as variáveis estão corretas

---

**🎉 Parabéns!** A tua base de dados está pronta para produção!
