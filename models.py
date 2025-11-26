from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# Base Model (Shared fields)
class PRBase(BaseModel):
    exercise: str = Field(..., min_length=2, description="Name of the exercise")
    weight: float = Field(..., gt=0, description="Weight in KG (must be positive)")
    reps: int = Field(..., gt=0, description="Number of repetitions")

# Create Model (Client input)
class PRCreate(PRBase):
    pass

# Update Model (Partial updates)
class PRUpdate(BaseModel):
    exercise: str | None = Field(None, min_length=2)
    weight: float | None = Field(None, gt=0)
    reps: int | None = Field(None, gt=0)

# Response Model (Server output)
class PR(PRBase):
    id: int
    performed_at: datetime

    # Pydantic configuration
    model_config = ConfigDict(from_attributes=True)