from fastapi import APIRouter

from .routes import assets, auth, halal, health

api_router = APIRouter()
api_router.include_router(assets.router)
api_router.include_router(auth.router)
api_router.include_router(halal.router)
api_router.include_router(health.router)
