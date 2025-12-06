from fastapi import FastAPI, HTTPException, status
from app.models import PR, PRCreate, PRUpdate
from .repository import PRRepository
from fastapi.responses import RedirectResponse

# Initialize App
app = FastAPI(
    title="Gym PR Tracker",
    description="Track your personal records and gym progress",
    version="1.0.0",
)

# Initialize Repository
repository = PRRepository()

# Endpoints


@app.get("/prs", response_model=list[PR])
def get_all_prs():
    return repository.list_all()


@app.get("/prs/{pr_id}", response_model=PR)
def get_pr(pr_id: int):
    pr = repository.get_by_id(pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    return pr


@app.post("/prs", response_model=PR, status_code=status.HTTP_201_CREATED)
def create_pr(pr_data: PRCreate):
    return repository.create(pr_data)


@app.put("/prs/{pr_id}", response_model=PR)
def update_pr(pr_id: int, pr_update: PRUpdate):
    updated_pr = repository.update(pr_id, pr_update)
    if not updated_pr:
        raise HTTPException(status_code=404, detail="PR not found")
    return updated_pr


@app.delete("/prs/{pr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pr(pr_id: int):
    success = repository.delete(pr_id)
    if not success:
        raise HTTPException(status_code=404, detail="PR not found")
    return None


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")
