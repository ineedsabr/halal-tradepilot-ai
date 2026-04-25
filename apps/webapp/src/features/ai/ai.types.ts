export type AIValidationStatus =
  | 'VALID'
  | 'INVALID_SCHEMA'
  | 'INVALID_SEMANTIC'
  | 'BLOCKED_SAFETY'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT';

export type AIGuardResponse = {
  status: AIValidationStatus;
  reasons: string[];
};
