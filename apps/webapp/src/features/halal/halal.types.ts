import type {
  AssetSummary,
  Confidence,
  DataFreshnessStatus,
  DataQualityStatus,
  InstrumentSummary,
} from '../../types/common';

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
  instrument: InstrumentSummary;
  assetStatus: HalalStatus;
  instrumentStatus: HalalStatus;
  combinedStatus: HalalStatus;
  methodology: string;
  confidence: Confidence;
  dataQualityStatus: DataQualityStatus;
  dataFreshnessStatus: DataFreshnessStatus;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  summary: string;
  blockingReason?: string;
  disclaimer: string;
};
