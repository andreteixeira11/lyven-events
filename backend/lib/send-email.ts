import { Resend } from 'resend';

const RESEND_API_KEY = 're_Hms97Gxb_Bq6YbsvhJC1DdfpETDbfRUti';

export async function sendNewUserEmail(userName: string, userEmail: string, userId: string) {
  try {
    const resend = new Resend(RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'Lyven <noreply@lyven.pt>',
      to: 'info@lyven.pt',
      subject: 'Novo Utilizador Registado',
      html: `
        <h2>Novo Utilizador Criado</h2>
        <p>Um novo utilizador foi registado na plataforma:</p>
        <ul>
          <li><strong>Nome:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>ID:</strong> ${userId}</li>
          <li><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</li>
        </ul>
        <p>O utilizador já pode aceder à plataforma.</p>
      `,
    });
    console.log('Email de novo utilizador enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email de novo utilizador:', error);
  }
}

export async function sendEventPendingEmail(eventTitle: string, eventId: string) {
  try {
    const resend = new Resend(RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'Lyven <noreply@lyven.pt>',
      to: 'info@lyven.pt',
      subject: 'Novo Evento Pendente de Aprovação',
      html: `
        <h2>Novo Evento Criado</h2>
        <p>Um novo evento foi criado e está aguardando aprovação:</p>
        <ul>
          <li><strong>Título:</strong> ${eventTitle}</li>
          <li><strong>ID:</strong> ${eventId}</li>
          <li><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</li>
        </ul>
        <p>Por favor, acesse o painel de administração para revisar e aprovar este evento.</p>
      `,
    });
    console.log('Email de evento pendente enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email de evento pendente:', error);
  }
}

export async function sendTestEmail() {
  try {
    const resend = new Resend(RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'Lyven <noreply@lyven.pt>',
      to: 'info@lyven.pt',
      subject: 'Email de Teste - Lyven',
      html: `
        <h2>Email de Teste</h2>
        <p>Este é um email de teste enviado do sistema Lyven.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        <p>Se recebeu este email, o sistema de envio de emails está funcionando corretamente!</p>
      `,
    });
    console.log('Email de teste enviado com sucesso:', result);
    return { success: true, message: 'Email enviado com sucesso', result };
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    return { success: false, message: 'Erro ao enviar email', error };
  }
}
