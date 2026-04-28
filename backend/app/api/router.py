from fastapi import APIRouter

from .routes import assets, auth, halal, health, instruments, me, risk, watchlist

api_router = APIRouter()
api_router.include_router(assets.router)
api_router.include_router(auth.router)
api_router.include_router(halal.router)
api_router.include_router(health.router)
api_router.include_router(instruments.router)
api_router.include_router(me.router)
api_router.include_router(risk.router)
api_router.include_router(watchlist.router)
