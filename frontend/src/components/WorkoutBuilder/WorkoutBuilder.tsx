import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { api } from "../../api";
import { Sparkles, Printer } from "lucide-react";
import styles from "./WorkoutBuilder.module.css";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  routine_name: string;
  schedule: WorkoutDay[];
  coach_tip: string;
}

export function WorkoutBuilder() {
  const [loading, setLoading] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [focusArea, setFocusArea] = useState("full_body");
  const [routine, setRoutine] = useState<WorkoutPlan | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Workout_Routine_${new Date().toISOString().split("T")[0]}`,
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRoutine(null);

    try {
      const data = await api.generateRoutine({
        fitness_level: fitnessLevel,
        days_per_week: daysPerWeek,
        focus_areas: focusArea,
      });
      // @ts-ignore - Backend returns strict JSON but types might vary slightly, force casting
      setRoutine(data as WorkoutPlan);
    } catch (err) {
      console.error("Failed to generate routine:", err);
      // Fallback is handled by backend return usually, or we show error
      alert("Failed to contact the AI Coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Sparkles className={styles.icon} size={32} />
        <h2>Your AI Coach</h2>
        <p>Design your perfect program !</p>
      </div>

      <form onSubmit={handleGenerate} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Fitness Level</label>
          <select
            className={styles.select}
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Days Per Week:{" "}
            <span style={{ color: "var(--primary-color)" }}>{daysPerWeek}</span>
          </label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="1"
              max="7"
              className={styles.range}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              style={{ cursor: "pointer" }}
            />
            <div className={styles.sliderLabels}>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <span
                  key={num}
                  onClick={() => setDaysPerWeek(num)}
                  className={`${styles.sliderLabel} ${daysPerWeek === num ? styles.activeLabel : ""}`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Focus Area</label>
          <select
            className={styles.select}
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
          >
            <option value="full_body">Full Body</option>
            <option value="upper_body">Upper Body</option>
            <option value="lower_body">Lower Body</option>
            <option value="push_pull_legs">Push / Pull / Legs</option>
            <option value="cardio_core">Cardio & Core</option>
            <option value="strength">Strength & Power</option>
            <option value="hypertrophy">Muscle Building (Hypertrophy)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Designing Plan..." : "Generate Routine"}
        </button>
      </form>

      {routine && (
        <div className={styles.resultContainer}>
          <div className={styles.actionButtons}>
            <button
              onClick={() => setRoutine(null)}
              className={styles.resetButton}
            >
              Start Over
            </button>
            <button
              onClick={() => handlePrint()}
              className={styles.printButton}
              title="Save as PDF"
            >
              <Printer size={18} style={{ marginRight: "8px" }} />
              Save to PDF
            </button>
          </div>

          <div ref={componentRef} className={styles.printableArea}>
            <h3
              className={styles.routineTitle}
              style={{
                textAlign: "center",
                color: "var(--primary-color)",
                marginBottom: "20px",
              }}
            >
              {routine.routine_name}
            </h3>

            <div className={styles.coachTip}>
              <span
                className={styles.tipIcon}
                style={{ fontSize: "1.5em", marginRight: "10px" }}
              >
                💡
              </span>
              <div
                className={styles.tipContent}
                style={{ display: "inline-block" }}
              >
                <h4 style={{ margin: 0, color: "var(--primary-color)" }}>
                  Coach's Note
                </h4>
                <p style={{ margin: "5px 0" }}>{routine.coach_tip}</p>
              </div>
            </div>

            <div className={styles.scheduleGrid}>
              {routine.schedule.map((day, index) => (
                <div key={index} className={styles.dayCard}>
                  <div className={styles.dayTitle}>
                    <span>{day.day}</span>
                    <span className={styles.focusBadge}>{day.focus}</span>
                  </div>
                  <div className={styles.exerciseList}>
                    {day.exercises.map((ex, idx) => (
                      <div key={idx} className={styles.exerciseItem}>
                        <span className={styles.exerciseName}>{ex.name}</span>
                        <div className={styles.exerciseDetails}>
                          <div className={styles.exerciseSetRep}>
                            {ex.sets} Sets x {ex.reps} Reps
                          </div>
                          {ex.notes && (
                            <div className={styles.exerciseNotes}>
                              {ex.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
