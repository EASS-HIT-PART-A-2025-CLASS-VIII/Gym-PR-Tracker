from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field

# User Table Model
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user") # "user" or "admin"

# User Schemas
class UserCreate(SQLModel):
    username: str
    password: str

class UserRead(SQLModel):
    id: int
    username: str
    role: str

class Token(SQLModel):
    access_token: str
    token_type: str

# Base Model (Shared fields)
class PRBase(SQLModel):
    exercise: str = Field(min_length=2, description="Name of the exercise")
    weight: float = Field(gt=0, description="Weight in KG (must be positive)")
    reps: int = Field(gt=0, description="Number of repetitions")

# Table Model (Database)
class PR(PRBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False)
    performed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Create Model (Client input)
class PRCreate(PRBase):
    pass

# Update Model (Partial updates)
class PRUpdate(SQLModel):
    exercise: Optional[str] = Field(default=None, min_length=2)
    weight: Optional[float] = Field(default=None, gt=0)
    reps: Optional[int] = Field(default=None, gt=0)

# Milestone Table Model (Database)
class Milestone(SQLModel, table=True):
    name: str = Field(primary_key=True)
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Milestone Response Model
class MilestoneRead(SQLModel):
    name: str
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: float
    target: float
    title: str
    description: str
    unit: str
