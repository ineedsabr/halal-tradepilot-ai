import type { AssetSummary, DataFreshnessStatus, DataQualityStatus } from '../../types/common';

export type AssetListItem = AssetSummary & {
  dataQuality?: DataQualityStatus;
  dataFreshness?: DataFreshnessStatus;
};
