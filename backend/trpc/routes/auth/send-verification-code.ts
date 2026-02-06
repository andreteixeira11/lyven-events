import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db';
import { verificationCodes, users } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.RESEND_API_KEY_DEV;
// Resend: use onboarding@resend.dev until your domain is verified (Resend dashboard → Domains)
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'Lyven <onboarding@resend.dev>';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendVerificationCodeProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      name: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('📧 [VERIFICATION] Iniciando envio de código de verificação');
    console.log('📧 [VERIFICATION] Email:', input.email);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Este email já está registado');
    }

    const code = generateVerificationCode();
    const id = `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    await db.insert(verificationCodes).values({
      id,
      email: input.email,
      code,
      name: input.name,
      password: input.password,
      expiresAt,
      isUsed: false,
    });

    console.log('🔑 [VERIFICATION] Código gerado:', code);
    console.log('⏰ [VERIFICATION] Expira em:', expiresAt);

    if (!RESEND_API_KEY) {
      console.error('❌ [VERIFICATION] RESEND_API_KEY não está definida. Defina RESEND_API_KEY no .env para enviar emails.');
      throw new Error('Serviço de email não configurado. Contacte o suporte.');
    }

    try {
      const resend = new Resend(RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: RESEND_FROM,
        to: input.email,
        subject: 'Código de Verificação - Lyven',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366F1; margin: 0;">Lyven</h1>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
              <h2 style="color: #333; margin-top: 0;">Código de Verificação</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Olá ${input.name}, bem-vindo(a) ao Lyven! Use o código abaixo para verificar o seu email:
              </p>
              
              <div style="background-color: #fff; border: 2px solid #6366F1; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #6366F1; letter-spacing: 5px;">
                  ${code}
                </span>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 20px;">
                Este código é válido por 3 minutos.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
              <p>Se não solicitou este código, pode ignorar este email.</p>
              <p style="margin-top: 20px;">© 2025 Lyven. Todos os direitos reservados.</p>
            </div>
          </div>
        `,
      });
      
      if (result.error) {
        console.error('❌ [VERIFICATION] Resend API error:', result.error);
        throw new Error(result.error.message || 'Falha ao enviar email. Tenta novamente.');
      }
      console.log('✅ [VERIFICATION] Email enviado com sucesso. Id:', result.data?.id);
    } catch (error: any) {
      console.error('❌ [VERIFICATION] Erro ao enviar email:', error);
      console.error('❌ [VERIFICATION] Error details:', JSON.stringify(error, null, 2));
      
      if (error.statusCode === 422) {
        throw new Error('Email inválido. Por favor, verifique o endereço de email.');
      }
      
      if (error.statusCode === 429) {
        throw new Error('Demasiadas tentativas. Por favor, aguarde alguns minutos e tente novamente.');
      }
      
      throw new Error('Erro ao enviar código de verificação. Por favor, tente novamente mais tarde.');
    }

    return {
      success: true,
      message: 'Código de verificação enviado para o seu email',
    };
  });
