import type { AssetSummary, DataFreshnessStatus, DataQualityStatus, InstrumentSummary } from '../../types/common';

export type AssetListItem = AssetSummary & {
  dataQuality?: DataQualityStatus;
  dataFreshness?: DataFreshnessStatus;
};

export type InstrumentTypeListItem = InstrumentSummary;
