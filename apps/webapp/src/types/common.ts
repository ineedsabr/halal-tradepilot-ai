export type DataQualityStatus =
  | 'VERIFIED'
  | 'ESTIMATED'
  | 'STALE'
  | 'CONFLICTING'
  | 'MISSING'
  | 'MANUAL_REVIEW_REQUIRED';

export type DataFreshnessStatus = 'FRESH' | 'ACCEPTABLE' | 'STALE' | 'MISSING';

export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type Language = 'ru' | 'en' | 'de';

export type Theme = 'light' | 'dark' | 'telegram';

export type UserLevel = 'learner' | 'trader' | 'pro';

export type RiskProfile = 'conservative' | 'moderate' | 'active';

export type AssetSummary = {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  dataQuality?: DataQualityStatus;
  dataFreshness?: DataFreshnessStatus;
};
