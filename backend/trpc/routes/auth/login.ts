import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db';
import { promoterAuth, users } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('🔐 [LOGIN] Iniciando processo de autenticação');
    console.log('🔐 [LOGIN] Email:', input.email);
    
    try {
      console.log('🔍 [LOGIN] Buscando credenciais na base de dados...');
      
      const authRecord = await db
        .select()
        .from(promoterAuth)
        .where(eq(promoterAuth.email, input.email))
        .limit(1);

      console.log('📋 [LOGIN] Registos de auth encontrados:', authRecord.length);

      if (authRecord.length === 0) {
        console.error('❌ [LOGIN] Email não encontrado');
        throw new Error('Credenciais inválidas');
      }

      console.log('🔑 [LOGIN] Verificando palavra-passe...');
      console.log('🔑 [LOGIN] Senha recebida:', input.password);
      console.log('🔑 [LOGIN] Senha armazenada:', authRecord[0].password);
      
      if (authRecord[0].password !== input.password) {
        console.error('❌ [LOGIN] Palavra-passe incorreta');
        throw new Error('Credenciais inválidas');
      }

      console.log('✅ [LOGIN] Palavra-passe correta!');
      console.log('🔍 [LOGIN] Buscando dados do utilizador...');
      
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, authRecord[0].userId))
        .limit(1);

      console.log('👤 [LOGIN] Utilizadores encontrados:', user.length);

      if (user.length === 0) {
        console.error('❌ [LOGIN] Utilizador não encontrado');
        throw new Error('Utilizador não encontrado');
      }

      console.log('✅ [LOGIN] Login bem sucedido para:', user[0].email);
      console.log('✅ [LOGIN] Dados do utilizador:', {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        userType: user[0].userType,
      });
      
      return {
        success: true,
        user: user[0],
      };
    } catch (error) {
      console.error('🔥 [LOGIN] Erro crítico no login:', error);
      console.error('🔥 [LOGIN] Stack:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  });
