from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health_returns_backend_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "backend"}


def test_health_allows_configured_webapp_origin() -> None:
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_health_rejects_unknown_origin() -> None:
    response = client.options(
        "/health",
        headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert "access-control-allow-origin" not in response.headers
