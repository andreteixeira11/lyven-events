/**
 * Error handling utilities for the LYVEN app
 */

export class NetworkError extends Error {
  constructor(message: string = 'Sem conexão à internet') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Credenciais inválidas') {
    super(message);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Recurso não encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Dados inválidos') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServerError extends Error {
  constructor(message: string = 'Erro no servidor') {
    super(message);
    this.name = 'ServerError';
  }
}

export type AppError = NetworkError | AuthError | NotFoundError | ValidationError | ServerError;

/**
 * Handles errors and returns user-friendly messages
 */
export const handleError = (error: unknown): string => {
  console.error('Error caught:', error);

  if (error && typeof error === 'object' && 'name' in error && error.name === 'BackendUnavailableError') {
    return String((error as Error).message);
  }

  if (error instanceof TypeError && (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network'))) {
    return 'Não foi possível conectar ao servidor. Verifique a sua ligação à internet e tente novamente.';
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  // Authentication errors
  if (error instanceof AuthError) {
    return error.message;
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return error.message;
  }

  // Validation errors
  if (error instanceof ValidationError) {
    return error.message;
  }

  // Server errors
  if (error instanceof ServerError) {
    return error.message;
  }

  // tRPC errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = String((error as Error).message);
    
    if (errorMessage.includes('Credenciais inválidas') || errorMessage.includes('invalid')) {
      return 'Credenciais inválidas. Verifica o email e palavra-passe.';
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('não encontrado')) {
      return 'Recurso não encontrado.';
    }
    
    const lowerMessage = errorMessage.toLowerCase();
    if (lowerMessage.includes('temporariamente indispon') || lowerMessage.includes('temporarily unavailable')) {
      return 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
    }
    if (lowerMessage.includes('não retornou uma resposta válida') || lowerMessage.includes('resposta inválida')) {
      return 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
    }
    if (lowerMessage.includes('backend não disponível') || lowerMessage.includes('backend may not be deployed')) {
      return 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('failed to fetch') || lowerMessage.includes('load failed')) {
      return 'Não foi possível conectar ao servidor. Verifique a sua ligação à internet e tente novamente.';
    }
    if (lowerMessage.includes('404')) {
      return 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
    }
    
    return errorMessage;
  }

  // Generic error
  return 'Ocorreu um erro inesperado. Por favor, tenta novamente.';
};

/**
 * Checks if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof NetworkError) return true;
  if (error instanceof ServerError) return true;
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('server');
  }
  
  return false;
};

/**
 * Extracts error code from error
 */
export const getErrorCode = (error: unknown): string | null => {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  return null;
};
