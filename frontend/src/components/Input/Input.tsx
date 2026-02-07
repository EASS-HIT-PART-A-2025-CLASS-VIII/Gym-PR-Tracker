import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelStyle?: React.CSSProperties;
}

export function Input({ label, id, style, labelStyle, ...props }: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.label} style={labelStyle}>
        {label}
      </label>
      <input id={inputId} className={styles.input} style={style} {...props} />
    </div>
  );
}
