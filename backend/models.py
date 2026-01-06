from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class PRBase(SQLModel):
    exercise: str = Field(min_length=2)
    muscle_group: str = "Other"
    weight: float = Field(gt=0)
    reps: int = Field(gt=0)
    performed_at: datetime = Field(default_factory=datetime.utcnow)

class PR(PRBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PRCreate(PRBase):
    pass

class PRUpdate(SQLModel):
    exercise: Optional[str] = None
    muscle_group: Optional[str] = None
    weight: Optional[float] = None
    reps: Optional[int] = None