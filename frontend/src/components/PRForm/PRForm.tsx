import { useState, useEffect } from "react";
import type { PRCreate } from "../../types";
import { Input } from "../Input/Input";
import styles from "./PRForm.module.css";

interface PRFormProps {
  onSubmit: (data: PRCreate) => Promise<void>;
  onCancel?: () => void;
  initialValues?: PRCreate;
}

export function PRForm({ onSubmit, onCancel, initialValues }: PRFormProps) {
  const [exercise, setExercise] = useState(initialValues?.exercise || "");
  const [weight, setWeight] = useState(initialValues?.weight.toString() || "");
  const [reps, setReps] = useState(initialValues?.reps.toString() || "");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setExercise(initialValues.exercise);
      setWeight(initialValues.weight.toString());
      setReps(initialValues.reps.toString());
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !weight || !reps) return;

    setLoading(true);
    try {
      await onSubmit({
        exercise,
        weight: parseFloat(weight),
        reps: parseInt(reps),
      });
      if (!initialValues) {
        setExercise("");
        setWeight("");
        setReps("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      {!initialValues && (
        <h3 className={styles.header}>
          DESTROY WEAKNESS! WHAT'S THE NEW PR, BRO?
        </h3>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="exercise-input" className={styles.label}>
            Exercise
          </label>
          <div className={styles.dropdownWrapper}>
            <input
              id="exercise-input"
              placeholder="Type or select exercise..."
              value={exercise}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onChange={(e) => {
                setExercise(e.target.value);
                setShowDropdown(true);
              }}
              className={styles.exerciseInput}
            />
            {showDropdown && (
              <div className={styles.dropdown}>
                {[
                  "Squat",
                  "Bench Press",
                  "Deadlift",
                  "Overhead Press",
                  "Pull Up",
                  "Barbell Row",
                  "Incline Bench Press",
                  "Dips",
                  "Romanian Deadlift",
                  "Leg Press",
                ]
                  .filter((ex) =>
                    ex.toLowerCase().includes(exercise.toLowerCase()),
                  )
                  .map((ex) => (
                    <div
                      key={ex}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setExercise(ex);
                        setShowDropdown(false);
                      }}
                      className={styles.dropdownItem}
                    >
                      {ex}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <Input
            id="weight-input"
            label="Weight (kg)"
            type="number"
            placeholder="0"
            min="0"
            step="0.05"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          <Input
            id="reps-input"
            label="Reps"
            type="number"
            placeholder="0"
            min="0"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>

        <div className={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.submitButtonLoading : ""}`}
          >
            {loading
              ? "Saving..."
              : initialValues
                ? "Update Record"
                : "Log Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
