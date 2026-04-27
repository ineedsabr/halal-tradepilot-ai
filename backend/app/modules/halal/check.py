from dataclasses import dataclass

from ...models import Asset, HalalAssessment, Instrument
from ...schemas.common import AssetSummary, Confidence, DataFreshnessStatus, DataQualityStatus, InstrumentSummary
from ...schemas.halal import HalalCheckResult, HalalStatus


DEFAULT_METHODOLOGY = "mvp_conservative_bootstrap"
HALAL_CHECK_DISCLAIMER = (
    "This app does not issue fatwas. This is educational screening based on selected methodology "
    "and available data. For religious certainty, consult a qualified scholar."
)


@dataclass(frozen=True)
class CombinedStatus:
    asset_status: HalalStatus
    instrument_status: HalalStatus
    combined_status: HalalStatus
    blocking_reason: str | None


def get_instrument_status(instrument: Instrument) -> HalalStatus:
    if instrument.is_absolute_restriction:
        return HalalStatus.AVOID
    return HalalStatus.HALAL


def combine_statuses(asset_status: HalalStatus, instrument: Instrument) -> CombinedStatus:
    instrument_status = get_instrument_status(instrument)
    if instrument_status == HalalStatus.AVOID:
        return CombinedStatus(
            asset_status=asset_status,
            instrument_status=instrument_status,
            combined_status=HalalStatus.AVOID,
            blocking_reason=instrument.restriction_reason,
        )

    if asset_status == HalalStatus.AVOID:
        combined_status = HalalStatus.AVOID
    elif asset_status == HalalStatus.SOURCE_CONFLICT:
        combined_status = HalalStatus.SOURCE_CONFLICT
    elif asset_status == HalalStatus.INSUFFICIENT_DATA:
        combined_status = HalalStatus.INSUFFICIENT_DATA
    elif asset_status == HalalStatus.SCHOLARLY_DISAGREEMENT:
        combined_status = HalalStatus.SCHOLARLY_DISAGREEMENT
    elif asset_status == HalalStatus.UNDER_REVIEW:
        combined_status = HalalStatus.UNDER_REVIEW
    elif asset_status == HalalStatus.DOUBTFUL:
        combined_status = HalalStatus.DOUBTFUL
    else:
        combined_status = HalalStatus.HALAL

    return CombinedStatus(
        asset_status=asset_status,
        instrument_status=instrument_status,
        combined_status=combined_status,
        blocking_reason=None,
    )


def build_halal_check_result(
    *,
    asset: Asset,
    instrument: Instrument,
    methodology: str,
    assessment: HalalAssessment | None,
) -> HalalCheckResult:
    if assessment is None:
        combined = combine_statuses(HalalStatus.INSUFFICIENT_DATA, instrument)
        return HalalCheckResult(
            asset=AssetSummary.model_validate(asset),
            instrument=InstrumentSummary.model_validate(instrument),
            asset_status=combined.asset_status,
            instrument_status=combined.instrument_status,
            combined_status=combined.combined_status,
            methodology=methodology,
            confidence=Confidence.LOW,
            data_quality_status=DataQualityStatus.MISSING,
            data_freshness_status=DataFreshnessStatus.MISSING,
            last_reviewed_at=None,
            next_review_at=None,
            summary="No current asset assessment is available for the selected methodology.",
            blocking_reason=combined.blocking_reason,
            disclaimer=HALAL_CHECK_DISCLAIMER,
        )

    asset_status = HalalStatus(assessment.asset_status)
    combined = combine_statuses(asset_status, instrument)
    blocking_reason = combined.blocking_reason
    if blocking_reason is None and combined.combined_status == HalalStatus.AVOID:
        blocking_reason = assessment.detailed_reason or assessment.summary

    return HalalCheckResult(
        asset=AssetSummary.model_validate(asset),
        instrument=InstrumentSummary.model_validate(instrument),
        asset_status=combined.asset_status,
        instrument_status=combined.instrument_status,
        combined_status=combined.combined_status,
        methodology=assessment.methodology,
        confidence=Confidence(assessment.confidence),
        data_quality_status=DataQualityStatus(assessment.data_quality_status),
        data_freshness_status=DataFreshnessStatus(assessment.data_freshness_status),
        last_reviewed_at=assessment.reviewed_at or assessment.created_at,
        next_review_at=assessment.next_review_at,
        summary=assessment.summary,
        blocking_reason=blocking_reason,
        disclaimer=HALAL_CHECK_DISCLAIMER,
    )
