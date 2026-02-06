# Resolução de erros ao abrir a app (QR / Backend)

Quando alguém abre a app (por exemplo, ao digitalizar o código QR) podem aparecer dois tipos de erro. Segue o que **a equipa deve fazer primeiro** e o que **o utilizador (comprador) deve fazer**.

---

## 1. Erro "React Native DevTools" / `libnspr4.so`

**O que é:** Erro no ambiente de desenvolvimento (ex.: Linux) ao instalar/abrir React Native DevTools. A biblioteca `libnspr4.so` não está instalada.

**Quem resolve:** Equipa técnica (não o comprador).

**O que fazer:**

- **Linux (Ubuntu/Debian):** instalar dependências NSS/NSPR:
  ```bash
  sudo apt-get update
  sudo apt-get install libnss3 libnspr4
  ```
- **Alternativa:** Se a app abrir na web/Expo Go sem DevTools, pode ignorar este erro ou desativar DevTools no projeto (configuração do Metro/Expo) para não bloquear.

Este erro é do **ambiente de desenvolvimento**; o comprador não o vê nem pode corrigi-lo.

---

## 2. "Backend não acessível" / "Serviço temporariamente indisponível"

**O que é:** A app não consegue ligar ao servidor (backend) configurado (ex.: `EXPO_PUBLIC_RORK_API_BASE_URL` ou o URL Rork em uso).

**O que a equipa deve fazer primeiro:**

1. **Se o backend corre no vosso PC:**
   - No PC, executar: `npm run start:all` (ou `npm run start:backend` noutro terminal).
   - Confirmar que o backend está a responder (ex.: abrir no browser o URL do backend + `/api/health`).

2. **Se o utilizador está no telemóvel (Expo Go):**
   - No ficheiro `.env` do projeto, colocar o **IP do PC** em vez de `localhost` (ex.: `EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.5:3000`).
   - Guardar e reiniciar o Expo (`npm run start:expo` ou o comando que usam).

3. **Se usam um backend em produção (ex.: Rork test/prod):**
   - Confirmar que o URL em `EXPO_PUBLIC_RORK_API_BASE_URL` (ou o default) está correto e que o serviço está online.

**O que o comprador/utilizador deve fazer:**

- Na ecrã de login, tocar em **"Tentar novamente"** (a app volta a verificar se o backend está acessível).
- Se continuar a falhar: aguardar alguns minutos e tentar de novo.
- Se o problema se mantiver: contactar o organizador do evento ou o suporte Lyven — a equipa técnica terá de garantir que o backend está a correr e acessível.

---

## Resumo

| Erro | Quem resolve | Ação principal |
|------|--------------|----------------|
| DevTools / libnspr4 | Equipa (Linux) | Instalar `libnss3` e `libnspr4` ou desativar DevTools |
| Backend não acessível | Equipa + utilizador | Equipa: ligar backend e/ou corrigir URL; Utilizador: "Tentar novamente" e, se precisar, contactar suporte |

A app foi atualizada para mostrar na ecrã de login uma mensagem clara para o utilizador ("O que pode fazer agora" e botão "Tentar novamente") e manter as instruções técnicas num texto menor para programadores.
