from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import Asset, HalalAssessment
from ...schemas.assets import AssetAssessmentSummary, AssetDetail, AssetSearchItem
from ...schemas.common import Confidence, DataFreshnessStatus
from ...schemas.halal import HalalStatus

router = APIRouter(prefix="/api/v1/assets", tags=["assets"])


def _latest_current_assessment(db: Session, asset_id: str) -> HalalAssessment | None:
    return db.scalar(
        select(HalalAssessment)
        .where(
            HalalAssessment.asset_id == asset_id,
            HalalAssessment.is_current.is_(True),
            HalalAssessment.deleted_at.is_(None),
        )
        .order_by(HalalAssessment.created_at.desc())
        .limit(1)
    )


def _to_search_item(asset: Asset, assessment: HalalAssessment | None) -> AssetSearchItem:
    return AssetSearchItem(
        id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        exchange=asset.exchange,
        sector=asset.sector,
        country=asset.country,
        currency=asset.currency,
        current_status=HalalStatus(assessment.asset_status) if assessment else None,
        confidence=Confidence(assessment.confidence) if assessment else None,
        data_freshness_status=DataFreshnessStatus(assessment.data_freshness_status) if assessment else None,
    )


def _to_assessment_summary(assessment: HalalAssessment | None) -> AssetAssessmentSummary | None:
    if assessment is None:
        return None

    return AssetAssessmentSummary(
        methodology=assessment.methodology,
        asset_status=HalalStatus(assessment.asset_status),
        summary=assessment.summary,
        source_name=assessment.source_name,
        source_url=assessment.source_url,
        data_quality_status=assessment.data_quality_status,
        data_freshness_status=assessment.data_freshness_status,
        confidence=assessment.confidence,
        reviewed_at=assessment.reviewed_at or assessment.created_at,
        next_review_at=assessment.next_review_at,
    )


@router.get("/search", response_model=list[AssetSearchItem])
def search_assets(
    q: str | None = Query(default=None),
    asset_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> list[AssetSearchItem]:
    statement = select(Asset).where(
        Asset.is_active.is_(True),
        Asset.is_public.is_(True),
        Asset.deleted_at.is_(None),
    )
    if asset_type:
        statement = statement.where(Asset.asset_type == asset_type)
    if q:
        pattern = f"%{q}%"
        statement = statement.where(or_(Asset.symbol.ilike(pattern), Asset.name.ilike(pattern)))

    assets = db.scalars(statement.order_by(Asset.symbol).limit(limit)).all()
    return [_to_search_item(asset, _latest_current_assessment(db, asset.id)) for asset in assets]


@router.get("/{asset_id}", response_model=AssetDetail)
def get_asset(asset_id: UUID, db: Session = Depends(get_db)) -> AssetDetail:
    asset = db.scalar(
        select(Asset).where(
            Asset.id == str(asset_id),
            Asset.is_active.is_(True),
            Asset.is_public.is_(True),
            Asset.deleted_at.is_(None),
        )
    )
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    assessment = _latest_current_assessment(db, asset.id)
    return AssetDetail(
        id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        exchange=asset.exchange,
        sector=asset.sector,
        country=asset.country,
        currency=asset.currency,
        is_active=asset.is_active,
        is_public=asset.is_public,
        latest_assessment=_to_assessment_summary(assessment),
    )
