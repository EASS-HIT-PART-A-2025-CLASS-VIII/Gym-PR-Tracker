import React from "react";
import styles from "./PopupDialog.module.css";

interface PopupDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function PopupDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  children,
}: PopupDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>{title}</h2>

        {message && <p className={styles.message}>{message}</p>}

        {children}

        {onConfirm && (
          <div className={styles.buttonGroup}>
            <button onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={onConfirm} className={styles.deleteButton}>
              Delete
            </button>
          </div>
        )}

        {!onConfirm && !children && (
          <button onClick={onCancel} className={styles.closeButton}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}
