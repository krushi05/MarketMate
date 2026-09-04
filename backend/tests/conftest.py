import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure test DB is used
TEST_DATABASE_URL = "sqlite:///./test_marketmate.db"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["DEMO_MODE"] = "true"

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.seed import seed_database
from backend.app.models import User
from backend.app.auth import create_access_token, get_password_hash

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_marketmate.db"):
        try:
            os.remove("./test_marketmate.db")
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def auth_headers(db_session):
    user = db_session.query(User).filter(User.email == "testuser@marketmate.local").first()
    if not user:
        user = User(
            name="Test User",
            email="testuser@marketmate.local",
            password_hash=get_password_hash("testpass123"),
            virtual_balance=100000.0,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def user2_auth_headers(db_session):
    user2 = db_session.query(User).filter(User.email == "user2@marketmate.local").first()
    if not user2:
        user2 = User(
            name="User Two",
            email="user2@marketmate.local",
            password_hash=get_password_hash("testpass123"),
            virtual_balance=100000.0,
        )
        db_session.add(user2)
        db_session.commit()
        db_session.refresh(user2)

    token = create_access_token(data={"sub": str(user2.id)})
    return {"Authorization": f"Bearer {token}"}
