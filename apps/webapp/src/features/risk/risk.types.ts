import type { Confidence } from '../../types/common';

export type RiskVerdict = 'ALLOWED_FOR_PAPER' | 'CAUTION' | 'BLOCKED' | 'INVALID_INPUT';

export type RiskCalculationResult = {
  verdict: RiskVerdict;
  confidence: Confidence;
  reasons: string[];
};
