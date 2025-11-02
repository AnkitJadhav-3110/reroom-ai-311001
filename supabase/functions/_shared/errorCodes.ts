// Standardized error codes for client responses
// Prevents information leakage while providing useful feedback

export const ErrorCodes = {
  // Authentication errors
  AUTH_MISSING: { code: 'AUTH_001', message: 'Authentication required' },
  AUTH_INVALID: { code: 'AUTH_002', message: 'Invalid or expired authentication' },
  
  // Validation errors
  VALIDATION_FAILED: { code: 'VAL_001', message: 'Invalid request parameters' },
  
  // Resource errors
  INSUFFICIENT_CREDITS: { code: 'RES_001', message: 'Insufficient credits' },
  RATE_LIMIT_EXCEEDED: { code: 'RES_002', message: 'Rate limit exceeded. Please try again later.' },
  
  // Service errors
  SERVICE_ERROR: { code: 'SVC_001', message: 'Service temporarily unavailable' },
  GENERATION_FAILED: { code: 'SVC_002', message: 'Generation failed. Please try again.' },
  
  // Configuration errors
  CONFIG_ERROR: { code: 'CFG_001', message: 'Service configuration error' },
} as const;

export function createErrorResponse(
  errorCode: typeof ErrorCodes[keyof typeof ErrorCodes],
  correlationId?: string
) {
  return {
    error: errorCode.message,
    code: errorCode.code,
    ...(correlationId && { correlationId }),
  };
}
