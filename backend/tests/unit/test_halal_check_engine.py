import pytest

from backend.app.models import Asset, Instrument
from backend.app.modules.halal.check import DEFAULT_METHODOLOGY, build_halal_check_result, combine_statuses
from backend.app.schemas.halal import HalalStatus


def make_asset(symbol: str = "TEST") -> Asset:
    asset = Asset(symbol=symbol, name=f"{symbol} Asset", asset_type="stock")
    asset.id = f"{symbol.lower()}-asset-id"
    return asset


def make_instrument(*, restricted: bool = False) -> Instrument:
    instrument = Instrument(
        code="FUTURES" if restricted else "SPOT_CRYPTO",
        name="Futures" if restricted else "Spot crypto",
        category="derivative" if restricted else "spot",
        is_absolute_restriction=restricted,
        restriction_reason="Restricted instrument" if restricted else None,
    )
    instrument.id = "restricted-instrument-id" if restricted else "spot-instrument-id"
    return instrument


@pytest.mark.parametrize("asset_status", list(HalalStatus))
def test_restricted_instrument_overrides_any_asset_status(asset_status: HalalStatus) -> None:
    combined = combine_statuses(asset_status, make_instrument(restricted=True))

    assert combined.asset_status == asset_status
    assert combined.instrument_status == HalalStatus.AVOID
    assert combined.combined_status == HalalStatus.AVOID
    assert combined.blocking_reason == "Restricted instrument"


@pytest.mark.parametrize(
    ("asset_status", "expected"),
    [
        (HalalStatus.SCHOLARLY_DISAGREEMENT, HalalStatus.SCHOLARLY_DISAGREEMENT),
        (HalalStatus.UNDER_REVIEW, HalalStatus.UNDER_REVIEW),
        (HalalStatus.DOUBTFUL, HalalStatus.DOUBTFUL),
    ],
)
def test_conservative_asset_status_is_not_upgraded_by_halal_instrument(
    asset_status: HalalStatus,
    expected: HalalStatus,
) -> None:
    combined = combine_statuses(asset_status, make_instrument())

    assert combined.instrument_status == HalalStatus.HALAL
    assert combined.combined_status == expected


def test_missing_asset_assessment_returns_insufficient_data() -> None:
    result = build_halal_check_result(
        asset=make_asset("NEW"),
        instrument=make_instrument(),
        methodology=DEFAULT_METHODOLOGY,
        assessment=None,
    )

    assert result.asset_status == HalalStatus.INSUFFICIENT_DATA
    assert result.instrument_status == HalalStatus.HALAL
    assert result.combined_status == HalalStatus.INSUFFICIENT_DATA
    assert result.data_quality_status == "MISSING"
    assert result.disclaimer


def test_halal_asset_status_with_non_restricted_instrument_combines_to_halal() -> None:
    result = combine_statuses(HalalStatus.HALAL, make_instrument())

    assert result.asset_status == HalalStatus.HALAL
    assert result.instrument_status == HalalStatus.HALAL
    assert result.combined_status == HalalStatus.HALAL
