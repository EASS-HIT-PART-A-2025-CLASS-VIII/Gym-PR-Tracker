// Global State (initialized here to be accessible everywhere)
window.globalPRs = [];
window.globalMilestoneData = [];
window.prImageCache = {};

const EXERCISE_TO_MUSCLE = {
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
    "Other": "Other"
};

const MUSCLE_GROUPS = [
    "Chest", "Legs", "Back", "Shoulders", "Arms", "Other"
];


const EXERCISE_IMAGE_POOLS = {
    "Bench Press": [
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop",
        "https://plus.unsplash.com/premium_photo-1679097163271-87c2fb2764f6?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=150&h=150&fit=crop"
    ],
    "Squat": [
        "https://images.unsplash.com/photo-1574680096141-1cddd32e016f?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop", // Leg press/squat vibe
        "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1579364046732-c21c2177c3e5?w=150&h=150&fit=crop"
    ],
    "Deadlift": [
        "https://images.unsplash.com/photo-1603287681836-e56695f4e9f8?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=150&h=150&fit=crop"
    ],
    "Other": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=150&h=150&fit=crop",
        "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=150&h=150&fit=crop"
    ]
};

const GENERIC_PULL_IMAGES = [
    "https://images.unsplash.com/photo-1598971639058-211a73287133?w=150&h=150&fit=crop", // Pullup
    "https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=150&h=150&fit=crop", // Rows
];

const GENERIC_PUSH_IMAGES = [
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=150&h=150&fit=crop", // Overhead
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop"  // Dumbbells
];
