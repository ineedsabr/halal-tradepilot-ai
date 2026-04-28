from dataclasses import dataclass, field
from decimal import Decimal

from ...schemas.risk import RiskCalculatorVerdict

MAX_RISK_PERCENT = Decimal("0.02")
MIN_RISK_REWARD = Decimal("1.0")
EDUCATIONAL_RISK_DISCLAIMER = (
    "This calculation is educational only. It does not provide religious certification, "
    "investment advice, or execution guidance."
)


@dataclass(frozen=True)
class RiskCalculationInput:
    deposit: Decimal
    entry_price: Decimal
    stop_loss: Decimal
    take_profit: Decimal | None
    risk_percent: Decimal
    halal_combined_status: str | None = None
    instrument_status: str | None = None
    context_invalid_reasons: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class RiskCalculationOutput:
    deposit: Decimal
    entry_price: Decimal
    stop_loss: Decimal
    take_profit: Decimal | None
    risk_percent: Decimal
    risk_amount: Decimal
    max_loss: Decimal
    stop_distance: Decimal
    position_size: Decimal
    risk_reward: Decimal | None
    verdict: RiskCalculatorVerdict
    reasons: list[str]
    halal_combined_status: str | None
    instrument_status: str | None
    educational_disclaimer: str = EDUCATIONAL_RISK_DISCLAIMER


def _is_positive(value: Decimal) -> bool:
    return value > Decimal("0")


def calculate_risk(input_data: RiskCalculationInput) -> RiskCalculationOutput:
    reasons: list[str] = list(input_data.context_invalid_reasons)

    if not _is_positive(input_data.deposit):
        reasons.append("Deposit must be greater than zero.")
    if not _is_positive(input_data.entry_price):
        reasons.append("Entry price must be greater than zero.")
    if not _is_positive(input_data.stop_loss):
        reasons.append("Stop loss must be greater than zero.")
    if not _is_positive(input_data.risk_percent):
        reasons.append("Risk percent must be greater than zero.")
    if input_data.take_profit is not None and not _is_positive(input_data.take_profit):
        reasons.append("Optional target price must be greater than zero when provided.")
    if input_data.entry_price == input_data.stop_loss:
        reasons.append("Entry price and stop loss must differ.")

    stop_distance = (
        abs(input_data.entry_price - input_data.stop_loss)
        if _is_positive(input_data.entry_price) and _is_positive(input_data.stop_loss)
        else Decimal("0")
    )
    risk_amount = (
        input_data.deposit * input_data.risk_percent
        if _is_positive(input_data.deposit) and _is_positive(input_data.risk_percent)
        else Decimal("0")
    )
    position_size = risk_amount / stop_distance if stop_distance > Decimal("0") else Decimal("0")
    risk_reward = (
        abs(input_data.take_profit - input_data.entry_price) / stop_distance
        if input_data.take_profit is not None and stop_distance > Decimal("0")
        else None
    )

    if reasons:
        return RiskCalculationOutput(
            deposit=input_data.deposit,
            entry_price=input_data.entry_price,
            stop_loss=input_data.stop_loss,
            take_profit=input_data.take_profit,
            risk_percent=input_data.risk_percent,
            risk_amount=risk_amount,
            max_loss=risk_amount,
            stop_distance=stop_distance,
            position_size=position_size,
            risk_reward=risk_reward,
            verdict=RiskCalculatorVerdict.INVALID,
            reasons=reasons,
            halal_combined_status=input_data.halal_combined_status,
            instrument_status=input_data.instrument_status,
        )

    blocked_reasons: list[str] = []
    caution_reasons: list[str] = []

    if input_data.risk_percent > MAX_RISK_PERCENT:
        blocked_reasons.append("Risk percent exceeds the 2% educational maximum.")
    if risk_reward is not None and risk_reward < MIN_RISK_REWARD:
        blocked_reasons.append("Target distance ratio is below 1.0.")
    if input_data.instrument_status == "AVOID":
        blocked_reasons.append("Selected instrument is restricted.")
    elif input_data.halal_combined_status == "AVOID":
        blocked_reasons.append("Asset and instrument screening blocks this combination.")

    if input_data.halal_combined_status in {
        "DOUBTFUL",
        "UNDER_REVIEW",
        "INSUFFICIENT_DATA",
        "SCHOLARLY_DISAGREEMENT",
        "SOURCE_CONFLICT",
    }:
        caution_reasons.append(
            f"Asset and instrument screening status is {input_data.halal_combined_status}."
        )

    if blocked_reasons:
        verdict = RiskCalculatorVerdict.BLOCKED
        reasons = blocked_reasons + caution_reasons
    elif caution_reasons:
        verdict = RiskCalculatorVerdict.CAUTION
        reasons = caution_reasons
    else:
        verdict = RiskCalculatorVerdict.ALLOWED
        reasons = []

    return RiskCalculationOutput(
        deposit=input_data.deposit,
        entry_price=input_data.entry_price,
        stop_loss=input_data.stop_loss,
        take_profit=input_data.take_profit,
        risk_percent=input_data.risk_percent,
        risk_amount=risk_amount,
        max_loss=risk_amount,
        stop_distance=stop_distance,
        position_size=position_size,
        risk_reward=risk_reward,
        verdict=verdict,
        reasons=reasons,
        halal_combined_status=input_data.halal_combined_status,
        instrument_status=input_data.instrument_status,
    )
