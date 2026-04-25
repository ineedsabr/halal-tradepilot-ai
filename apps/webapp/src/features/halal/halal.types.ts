import type { AssetSummary, Confidence, DataFreshnessStatus, DataQualityStatus } from '../../types/common';

export type HalalStatus =
  | 'HALAL'
  | 'DOUBTFUL'
  | 'AVOID'
  | 'UNDER_REVIEW'
  | 'INSUFFICIENT_DATA'
  | 'SCHOLARLY_DISAGREEMENT'
  | 'SOURCE_CONFLICT';

export type HalalCheckResult = {
  asset: AssetSummary;
  status: HalalStatus;
  confidence: Confidence;
  dataQuality: DataQualityStatus;
  dataFreshness: DataFreshnessStatus;
  reasons: string[];
};
