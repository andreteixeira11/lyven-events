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
  const rorkUrl = `https://rork.app/pa/07mpjpnu098wcqwfiffs1/backend`;
  console.log('🌐 Using default Rork backend URL:', rorkUrl);
  return rorkUrl;
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

const fetchWithRetry = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES} for:`, String(url).substring(0, 100));
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }

      const response = await fetch(url, options);

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        const text = await response.clone().text();
        console.error('❌ Response error:', response.status, text.substring(0, 300));

        if (!contentType?.includes('application/json')) {
          throw new Error('O servidor não retornou uma resposta JSON válida.');
        }
      }

      if (response.ok && contentType && !contentType.includes('application/json')) {
        throw new Error('O servidor retornou uma resposta inválida.');
      }

      return response;
    } catch (error) {
      lastError = error;
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error && error.message.toLowerCase().includes('network'));

      if (!isNetworkError || attempt === MAX_RETRIES) {
        console.error('❌ Fetch failed:', error);
        throw error;
      }
      console.warn(`⚠️ Network error on attempt ${attempt + 1}, will retry...`);
    }
  }

  throw lastError;
};

const trpcUrl = `${getBaseUrl()}/api/trpc`;

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      fetch: fetchWithRetry,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: trpcUrl,
      fetch: fetchWithRetry,
    }),
  ],
});
