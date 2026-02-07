import os
import httpx
import json
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

# --- Models ---
class WorkoutRequest(BaseModel):
    fitness_level: str
    days_per_week: int
    focus_areas: Optional[str] = None

class Exercise(BaseModel):
    name: str
    sets: str
    reps: str
    notes: Optional[str] = None

class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: List[Exercise]

class WorkoutPlan(BaseModel):
    routine_name: str
    schedule: List[WorkoutDay]
    coach_tip: str

# --- Service Logic ---
class AICoachService:
    @staticmethod
    async def generate_routine(request: WorkoutRequest) -> WorkoutPlan:
        use_mock = os.getenv("USE_MOCK_AI", "False").lower() == "true"
        
        if use_mock:
            print("DEBUG: Mock Mode is ON. Returning fake data (No Cost).")
            return WorkoutPlan(
                routine_name="Test Routine (Mock Mode)",
                schedule=[
                    WorkoutDay(
                        day="Day 1 (Mock)",
                        focus="Testing",
                        exercises=[
                            Exercise(name="Mock Squat", sets=3, reps="10", notes="This is fake data"),
                            Exercise(name="Debug Press", sets=3, reps="10", notes="Saved you money!")
                        ]
                    )
                ],
                coach_tip="This is a mock response because USE_MOCK_AI is set to True in .env file."
            )

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise Exception("Missing OPENAI_API_KEY in .env file")

        system_prompt = """
        You are an expert fitness coach. Create a workout routine based on the user's request.
        
        CRITICAL RULES:
        1. You MUST return ONLY valid JSON.
        2. The 'exercises' list for EACH day MUST contain a MINIMUM of 5 exercises. Less than 5 is unacceptable.
        3. Aim for 5-8 exercises per day.
        
        JSON Structure:
        {
            "routine_name": "string",
            "schedule": [
                {
                    "day": "string",
                    "focus": "string",
                    "exercises": [
                        {"name": "string", "sets": "string (e.g. 3-4)", "reps": "string (e.g. 8-12)", "notes": "string"}
                    ]
                }
            ],
            "coach_tip": "string"
        }
        """

        user_prompt = f"Level: {request.fitness_level}, Days: {request.days_per_week}, Focus: {request.focus_areas}. IMPORTANT: Every single workout day MUST include at least one exercise targeting {request.focus_areas}. CRITICAL: You MUST provide at least 5 exercises per day. If you provide less than 5, the system will fail. VITAL: ENSURE VARIETY. Compound movements (like squats, bench) should generally have lower reps (e.g., 5-8) and isolation movements (like curls, flyes) should have higher reps (e.g., 10-15). Do NOT output the same sets/reps for every exercise."

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                plan_dict = json.loads(content)
                return WorkoutPlan(**plan_dict)

            except Exception as e:
                print(f"Error calling OpenAI: {e}")
                return WorkoutPlan(
                    routine_name="Fallback Routine (Connection Error)",
                    schedule=[
                        WorkoutDay(
                            day="Error Day",
                            focus="None",
                            exercises=[Exercise(name="Rest", sets="0", reps="0", notes=str(e))]
                        )
                    ],
                    coach_tip="Could not connect to OpenAI. Please check your API Key and Credit."
                )

# --- FastAPI Setup ---
app = FastAPI()

@app.post("/generate_routine")
async def generate_workout_endpoint(request: WorkoutRequest):
    return await AICoachService.generate_routine(request)