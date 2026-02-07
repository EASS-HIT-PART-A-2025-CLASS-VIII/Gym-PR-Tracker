from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models import PR, PRCreate, PRUpdate, Milestone, MilestoneRead, User, UserCreate, Token
from app.db import init_db, get_session
from .repository import PRRepository, UserRepository
from .auth import get_password_hash, verify_password, create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.responses import RedirectResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

# Initialize App
app = FastAPI(
    title="Gym PR Tracker",
    description="Track your personal records and gym progress",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Dependencies
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    session: AsyncSession = Depends(get_session)
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user_repo = UserRepository(session)
    user = await user_repo.get_by_username(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

# Auth Endpoints
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    repo = UserRepository(session)
    existing = await repo.get_by_username(user_data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed = get_password_hash(user_data.password)
    user = User(username=user_data.username, hashed_password=hashed)
    await repo.create(user)
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    repo = UserRepository(session)
    user = await repo.get_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# PR Endpoints
@app.get("/prs", response_model=list[PR])
async def get_all_prs(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    repo = PRRepository(session, current_user.id)
    return await repo.list_all()

@app.get("/prs/{pr_id}", response_model=PR)
async def get_pr(
    pr_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    repo = PRRepository(session, current_user.id)
    pr = await repo.get_by_id(pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    return pr

@app.post("/prs", response_model=PR, status_code=status.HTTP_201_CREATED)
async def create_pr(
    pr_data: PRCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        repo = PRRepository(session, current_user.id)
        return await repo.create(pr_data)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        with open("error_log.txt", "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n")
            f.write(error_details)
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")

@app.put("/prs/{pr_id}", response_model=PR)
async def update_pr(
    pr_id: int, 
    pr_update: PRUpdate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    repo = PRRepository(session, current_user.id)
    updated_pr = await repo.update(pr_id, pr_update)
    if not updated_pr:
        raise HTTPException(status_code=404, detail="PR not found")
    return updated_pr

@app.delete("/prs/{pr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pr(
    pr_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    repo = PRRepository(session, current_user.id)
    success = await repo.delete(pr_id)
    if not success:
        raise HTTPException(status_code=404, detail="PR not found")
    return None

@app.get("/milestones", response_model=list[MilestoneRead])
async def get_milestones(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    repo = PRRepository(session, current_user.id)
    return await repo.get_milestones()

from .ai_coach import AICoachService, WorkoutPlan, WorkoutRequest

@app.post("/ai/generate_routine", response_model=WorkoutPlan)
async def generate_workout_routine(
    request: WorkoutRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await AICoachService.generate_routine(request)

@app.get("/admin/users", response_model=list[User])
async def get_all_users_admin(
    session: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_admin_user)
):
    repo = UserRepository(session)
    from sqlmodel import select
    result = await session.exec(select(User))
    return list(result.all())

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
