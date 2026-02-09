import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  try {
    const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    if (envUrl) {
      console.log('🌐 TRPC Base URL (backend):', envUrl);
      return envUrl;
    }
    const rorkUrl = `https://rork.app/pa/07mpjpnu098wcqwfiffs1/backend`;
    console.log('🌐 Using default Rork backend URL:', rorkUrl);
    return rorkUrl;
  } catch (error) {
    console.error('❌ Error getting base URL:', error);
    return 'https://rork.app/pa/07mpjpnu098wcqwfiffs1/backend';
  }
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

class BackendUnavailableError extends Error {
  constructor(message: string = 'O servidor está temporariamente indisponível. Tente novamente em alguns minutos.') {
    super(message);
    this.name = 'BackendUnavailableError';
  }
}

const createTimeoutSignal = (ms: number): AbortSignal => {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch (_e) {
    console.log('AbortSignal.timeout not available, using fallback');
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

const fetchWithRetry = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${MAX_RETRIES} for:`, String(url).substring(0, 100));
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }

      const response = await fetch(url, {
        ...options,
        signal: options?.signal ?? createTimeoutSignal(15000),
      });

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('text/html')) {
        const text = await response.clone().text();
        console.error('❌ Backend returned HTML instead of JSON:', text.substring(0, 200));
        if (text.includes('Service Temporarily Unavailable') || text.includes('temporarily unavailable')) {
          throw new BackendUnavailableError();
        }
        throw new BackendUnavailableError('O servidor não está a responder corretamente. Tente novamente mais tarde.');
      }

      if (!response.ok) {
        const text = await response.clone().text();
        console.error('❌ Response error:', response.status, text.substring(0, 300));

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new BackendUnavailableError();
        }

        if (!contentType?.includes('application/json')) {
          throw new BackendUnavailableError('O servidor não retornou uma resposta válida.');
        }
      }

      if (response.ok && contentType && !contentType.includes('application/json')) {
        throw new BackendUnavailableError('O servidor retornou uma resposta inválida.');
      }

      return response;
    } catch (error) {
      lastError = error;

      if (error instanceof BackendUnavailableError) {
        console.error('❌ Backend unavailable:', error.message);
        if (attempt === MAX_RETRIES) throw error;
        console.warn(`⚠️ Backend unavailable, retry ${attempt + 1}/${MAX_RETRIES}...`);
        continue;
      }

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

let trpcUrl: string;
try {
  trpcUrl = `${getBaseUrl()}/api/trpc`;
} catch (error) {
  console.error('❌ Error building tRPC URL:', error);
  trpcUrl = 'https://rork.app/pa/07mpjpnu098wcqwfiffs1/backend/api/trpc';
}

let trpcReactClient: ReturnType<typeof trpc.createClient>;
let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

try {
  trpcReactClient = trpc.createClient({
    links: [
      httpLink({
        url: trpcUrl,
        fetch: fetchWithRetry,
      }),
    ],
  });
} catch (error) {
  console.error('❌ Error creating tRPC React client:', error);
  trpcReactClient = trpc.createClient({
    links: [
      httpLink({
        url: trpcUrl,
      }),
    ],
  });
}

try {
  trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: trpcUrl,
        fetch: fetchWithRetry,
      }),
    ],
  });
} catch (error) {
  console.error('❌ Error creating tRPC client:', error);
  trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: trpcUrl,
      }),
    ],
  });
}

export { trpcReactClient, trpcClient };
