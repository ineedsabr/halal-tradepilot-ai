from decimal import Decimal

from backend.app.modules.risk.calculator import RiskCalculationInput, calculate_risk


def make_input(**overrides) -> RiskCalculationInput:
    values = {
        "deposit": Decimal("10000"),
        "entry_price": Decimal("100"),
        "stop_loss": Decimal("90"),
        "take_profit": Decimal("120"),
        "risk_percent": Decimal("0.01"),
    }
    values.update(overrides)
    return RiskCalculationInput(**values)


def test_risk_formula_is_correct() -> None:
    result = calculate_risk(make_input())

    assert result.risk_amount == Decimal("100.00")
    assert result.max_loss == Decimal("100.00")
    assert result.stop_distance == Decimal("10")
    assert result.position_size == Decimal("10.00")
    assert result.risk_reward == Decimal("2")
    assert result.verdict == "ALLOWED"
    assert result.reasons == []


def test_take_profit_omitted_works() -> None:
    result = calculate_risk(make_input(take_profit=None))

    assert result.risk_reward is None
    assert result.verdict == "ALLOWED"


def test_entry_price_equal_stop_loss_is_invalid() -> None:
    result = calculate_risk(make_input(entry_price=Decimal("100"), stop_loss=Decimal("100")))

    assert result.verdict == "INVALID"
    assert "Entry price and stop loss must differ." in result.reasons
    assert result.position_size == Decimal("0")


def test_non_positive_inputs_are_invalid() -> None:
    result = calculate_risk(
        make_input(
            deposit=Decimal("0"),
            entry_price=Decimal("-1"),
            stop_loss=Decimal("0"),
            risk_percent=Decimal("0"),
        )
    )

    assert result.verdict == "INVALID"
    assert "Deposit must be greater than zero." in result.reasons
    assert "Entry price must be greater than zero." in result.reasons
    assert "Stop loss must be greater than zero." in result.reasons
    assert "Risk percent must be greater than zero." in result.reasons


def test_risk_percent_above_two_percent_is_blocked() -> None:
    result = calculate_risk(make_input(risk_percent=Decimal("0.03")))

    assert result.verdict == "BLOCKED"
    assert "Risk percent exceeds the 2% educational maximum." in result.reasons


def test_low_risk_reward_is_blocked() -> None:
    result = calculate_risk(make_input(take_profit=Decimal("105")))

    assert result.risk_reward == Decimal("0.5")
    assert result.verdict == "BLOCKED"
    assert "Target distance ratio is below 1.0." in result.reasons


def test_restricted_instrument_is_blocked() -> None:
    result = calculate_risk(make_input(instrument_status="AVOID", halal_combined_status="AVOID"))

    assert result.verdict == "BLOCKED"
    assert "Selected instrument is restricted." in result.reasons


def test_conservative_halal_status_adds_caution() -> None:
    result = calculate_risk(make_input(instrument_status="HALAL", halal_combined_status="UNDER_REVIEW"))

    assert result.verdict == "CAUTION"
    assert "Asset and instrument screening status is UNDER_REVIEW." in result.reasons


def test_response_text_has_no_advice_or_signal_wording() -> None:
    result = calculate_risk(make_input(halal_combined_status="SCHOLARLY_DISAGREEMENT"))
    text = " ".join([*result.reasons, result.educational_disclaimer]).lower()

    for forbidden in ("buy", "sell", "profit", "signal"):
        assert forbidden not in text
