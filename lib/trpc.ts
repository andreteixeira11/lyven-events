import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  try {
    const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    if (envUrl) {
      const cleanUrl = envUrl.replace(/\/+$/, '');
      console.log('🌐 TRPC Base URL (backend):', cleanUrl);
      return cleanUrl;
    }
    console.warn('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL not set');
    return '';
  } catch (error) {
    console.error('❌ Error getting base URL:', error);
    return '';
  }
};

const MAX_RETRIES = 1;
const RETRY_DELAY = 2000;

class BackendUnavailableError extends Error {
  constructor(message: string = 'Server temporarily unavailable. Please try again.') {
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
        throw new BackendUnavailableError('Server is not responding correctly. Please try again later.');
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Backend endpoint not found (404). Backend may still be starting.');
          throw new BackendUnavailableError('Backend is starting up. Please wait a moment and try again.');
        }

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new BackendUnavailableError('Backend is temporarily unavailable. Please try again.');
        }

        const text = await response.clone().text();
        console.error('❌ Response error:', response.status, text.substring(0, 300));

        if (!contentType?.includes('application/json')) {
          throw new BackendUnavailableError('Server did not return a valid response. Status: ' + response.status);
        }
      }

      if (response.ok && contentType && !contentType.includes('application/json')) {
        console.warn('⚠️ Response is not JSON:', contentType);
        throw new BackendUnavailableError('Invalid server response format.');
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
  const base = getBaseUrl();
  trpcUrl = base ? `${base}/api/trpc` : '/api/trpc';
  console.log('🌐 tRPC URL:', trpcUrl);
} catch (error) {
  console.error('❌ Error building tRPC URL:', error);
  trpcUrl = '/api/trpc';
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
