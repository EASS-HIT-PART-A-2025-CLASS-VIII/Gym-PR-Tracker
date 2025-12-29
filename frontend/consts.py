MUSCLE_OPTIONS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Other"]

EXERCISE_MAP = {
    "Bench Press": "Chest",
    "Incline Dumbbell Press": "Chest",
    "Squat": "Legs",
    "Leg Press": "Legs",
    "Lunges": "Legs",
    "Deadlift": "Back",
    "Pull Up": "Back",
    "Barbell Row": "Back",
    "Overhead Press": "Shoulders",
    "Lateral Raise": "Shoulders",
    "Dumbbell Curl": "Arms",
    "Tricep Extension": "Arms",
}

EXERCISE_OPTIONS = sorted(list(EXERCISE_MAP.keys())) + ["Other..."]