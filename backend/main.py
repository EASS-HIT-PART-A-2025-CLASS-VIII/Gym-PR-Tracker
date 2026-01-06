from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from backend.database import create_db_and_tables
from backend.models import PR, PRCreate, PRUpdate
from .repository import PRRepository


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

# Initialize App
app = FastAPI(
    title="Gym PR Tracker",
    description="Track your personal records and gym progress",
    version="1.0.0",
)

# Initialize Repository
repository = PRRepository()

# Mount Static Files (Serving from 'frontend' folder)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Initialize Templates
templates = Jinja2Templates(directory="frontend/templates")

# Endpoints

# READ ALL
@app.get("/prs", response_model=list[PR])
def get_all_prs():
    return repository.list_all()

# READ
@app.get("/prs/{pr_id}", response_model=PR)
def get_pr(pr_id: int):
    pr = repository.get_by_id(pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    return pr

# CREATE
@app.post("/prs", response_model=PR, status_code=status.HTTP_201_CREATED)
def create_pr(pr_data: PRCreate):
    return repository.create(pr_data)

# UPDATE
@app.put("/prs/{pr_id}", response_model=PR)
def update_pr(pr_id: int, pr_update: PRUpdate):
    try:
        updated_pr = repository.update(pr_id, pr_update)
        if not updated_pr:
            raise HTTPException(status_code=404, detail="PR not found")
        return updated_pr
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc() # Print to server console
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {repr(e)}")

# DELETE
@app.delete("/prs/{pr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pr(pr_id: int):
    success = repository.delete(pr_id)
    if not success:
        raise HTTPException(status_code=404, detail="PR not found")
    return None


@app.get("/", include_in_schema=False)
def root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

