import { Trash2, Calendar, Pencil } from "lucide-react";
import type { PR } from "../../types";
import styles from "./PRCard.module.css";

interface PRCardProps {
  personalRecord: PR;
  onEdit: (personalRecord: PR) => void;
  onDelete: (recordId: number) => void;
}

export function PRCard({ personalRecord, onEdit, onDelete }: PRCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>{personalRecord.exercise}</div>
        <div className={styles.details}>
          <span className={styles.weight}>{personalRecord.weight} kg</span>x{" "}
          {personalRecord.reps} reps
          <span className={styles.date}>
            <Calendar size={14} />
            {new Date(personalRecord.performed_at).toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => onEdit(personalRecord)}
          className={styles.editButton}
          title="Edit Record"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(personalRecord.id)}
          className={styles.deleteButton}
          title="Delete Record"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
