from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import Asset, HalalAssessment, User, WatchlistItem
from ...modules.auth.dependencies import get_current_user
from ...schemas.common import Confidence, DataFreshnessStatus
from ...schemas.halal import HalalStatus
from ...schemas.watchlist import WatchlistItemCreate, WatchlistItemRead

router = APIRouter(prefix="/api/v1/watchlist", tags=["watchlist"])

MAX_FREE_WATCHLIST_ITEMS = 5


def _utc_now() -> datetime:
    return datetime.now(tz=UTC)


def _get_public_asset(db: Session, asset_id: str) -> Asset | None:
    return db.scalar(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.is_active.is_(True),
            Asset.is_public.is_(True),
            Asset.deleted_at.is_(None),
        )
    )


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


def _active_item_count(db: Session, user_id: str) -> int:
    return db.scalar(
        select(func.count())
        .select_from(WatchlistItem)
        .where(
            WatchlistItem.user_id == user_id,
            WatchlistItem.deleted_at.is_(None),
        )
    ) or 0


def _active_item_for_asset(db: Session, user_id: str, asset_id: str) -> WatchlistItem | None:
    return db.scalar(
        select(WatchlistItem).where(
            WatchlistItem.user_id == user_id,
            WatchlistItem.asset_id == asset_id,
            WatchlistItem.deleted_at.is_(None),
        )
    )


def _to_response(asset: Asset, item: WatchlistItem, assessment: HalalAssessment | None) -> WatchlistItemRead:
    return WatchlistItemRead(
        watchlist_item_id=item.id,
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        exchange=asset.exchange,
        currency=asset.currency,
        current_status=HalalStatus(assessment.asset_status) if assessment else None,
        confidence=Confidence(assessment.confidence) if assessment else None,
        data_freshness_status=DataFreshnessStatus(assessment.data_freshness_status) if assessment else None,
        created_at=item.created_at,
    )


@router.get("", response_model=list[WatchlistItemRead])
def list_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[WatchlistItemRead]:
    rows = db.execute(
        select(WatchlistItem, Asset)
        .join(Asset, WatchlistItem.asset_id == Asset.id)
        .where(
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.deleted_at.is_(None),
            Asset.is_active.is_(True),
            Asset.is_public.is_(True),
            Asset.deleted_at.is_(None),
        )
        .order_by(WatchlistItem.created_at.desc())
    ).all()

    return [_to_response(asset, item, _latest_current_assessment(db, asset.id)) for item, asset in rows]


@router.post("", response_model=WatchlistItemRead, status_code=status.HTTP_201_CREATED)
def add_watchlist_item(
    payload: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WatchlistItemRead:
    asset = _get_public_asset(db, str(payload.asset_id))
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    if _active_item_for_asset(db, current_user.id, asset.id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Asset already in watchlist")

    if _active_item_count(db, current_user.id) >= MAX_FREE_WATCHLIST_ITEMS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Watchlist limit reached")

    item = WatchlistItem(user_id=current_user.id, asset_id=asset.id)
    db.add(item)
    db.commit()
    db.refresh(item)

    return _to_response(asset, item, _latest_current_assessment(db, asset.id))


@router.delete("/{watchlist_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watchlist_item(
    watchlist_item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    item = db.scalar(
        select(WatchlistItem).where(
            WatchlistItem.id == str(watchlist_item_id),
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.deleted_at.is_(None),
        )
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist item not found")

    item.deleted_at = _utc_now()
    db.commit()
