export type RiskVerdict = 'ALLOWED_FOR_PAPER' | 'CAUTION' | 'BLOCKED' | 'INVALID_INPUT';

export type RiskCalculationResult = {
  positionSize: string;
  maxLoss: string;
  riskReward?: string;
  verdict: RiskVerdict;
  blockedReason?: string;
  cautionReason?: string;
  explanation: string;
};

export type RiskCalculatorVerdict = 'ALLOWED' | 'CAUTION' | 'BLOCKED' | 'INVALID';
