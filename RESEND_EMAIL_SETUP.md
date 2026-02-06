# Receber o código de verificação por email (Resend)

O backend usa **Resend** para enviar o código de verificação. Para o email chegar à tua caixa de entrada:

## 1. API Key no `.env`

No ficheiro `.env` na raiz do projeto:

```env
RESEND_API_KEY=re_sua_chave_aqui
```

A chave está em [resend.com](https://resend.com) → **API Keys**.

## 2. Envio com domínio de teste (sem verificar domínio)

Por defeito o backend usa **`onboarding@resend.dev`** como remetente (domínio de teste da Resend).

**Importante:** Sem verificar um domínio na Resend, eles **só entregam emails ao endereço com que te registaste na Resend**. Para testar:

- Regista-te na Resend com o **mesmo email** que usas na app para “Criar conta”, **ou**
- Usa na app um email que seja o da tua conta Resend.

Assim o código de verificação deve chegar ao teu email.

## 3. Envio para qualquer email (produção)

Para enviar para **qualquer** email (não só o da conta Resend):

1. Entra em [resend.com](https://resend.com) → **Domains**.
2. Clica **Add Domain** e adiciona o teu domínio (ex: `lyven.pt`).
3. Configura os registos DNS (SPF, DKIM, etc.) que a Resend indicar.
4. Depois de o domínio estar verificado, no `.env`:

```env
RESEND_FROM_EMAIL=Lyven <noreply@lyven.pt>
```

(Substitui `lyven.pt` pelo teu domínio.)

5. Reinicia o backend e volta a pedir o código na app.

## 4. Se ainda não recebes o email

- Confirma no **terminal do backend** se aparece `✅ [VERIFICATION] Email enviado com sucesso` ou algum erro.
- Confere a pasta **Spam** do teu email.
- Se usas `onboarding@resend.dev`, testa com o **mesmo email** da tua conta Resend.
- Na Resend → **Logs** podes ver se o email foi aceite ou rejeitado e porquê.
