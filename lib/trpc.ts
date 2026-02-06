import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl) {
    console.log('🌐 TRPC Base URL (backend):', envUrl);
    return envUrl;
  }
  const rorkUrl = `https://rork.app/pa/hfa30k1ymcso2y545gvqm/backend`;
  console.log('🌐 Using default Rork backend URL:', rorkUrl);
  return rorkUrl;
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      fetch: async (url, options) => {
        console.log('🔗 tRPC Request:', url);
        console.log('📦 Request options:', options?.method, options?.headers);
        
        try {
          const response = await fetch(url, options);
          console.log('✅ Response status:', response.status);
          
          const contentType = response.headers.get('content-type');
          console.log('📑 Content-Type:', contentType);
          
          if (!response.ok) {
            const text = await response.clone().text();
            console.error('❌ Response error body:', text.substring(0, 500));
            
            if (!contentType?.includes('application/json')) {
              console.error('❌ Resposta não é JSON! Content-Type:', contentType);
              throw new Error('O servidor não retornou uma resposta JSON válida. Verifique se o backend está a funcionar corretamente.');
            }
          }
          
          if (response.ok && contentType && !contentType.includes('application/json')) {
            const text = await response.clone().text();
            console.error('❌ Resposta bem-sucedida mas não é JSON:', text.substring(0, 500));
            throw new Error('O servidor retornou uma resposta inválida.');
          }
          
          return response;
        } catch (error) {
          console.error('❌ Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
