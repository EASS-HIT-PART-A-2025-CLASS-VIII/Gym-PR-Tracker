import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Target,
  Zap,
  Dumbbell,
} from "lucide-react";
import { api } from "../../api";
import type { PR, Milestone } from "../../types";
import styles from "./Milestones.module.css";

interface MilestonesProps {
  prs: PR[];
}

export function Milestones({ prs }: MilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const data = await api.getMilestones();
        setMilestones(data);
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, [prs]);

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      novice: Target,
      gains: Flame,
      destroyer: Crown,
      "chest-pounder": Dumbbell,
      "squat-king": Crown,
      "earth-shaker": Zap,
      "shoulder-titan": Medal,
      "wing-master": Target,
      "back-builder": Flame,
      "incline-ace": Medal,
      "dip-demon": Flame,
      "hinge-master": Target,
      "leg-press-lord": Crown,
      century: Trophy,
      "double-century": Medal,
      "rep-king": Zap,
    };
    return icons[name] || Trophy;
  };

  if (loading && milestones.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Milestones</h2>

      <div className={styles.grid}>
        {milestones.map((ms) => {
          const Icon = getIcon(ms.name);
          const progressPercent = (ms.progress / ms.target) * 100;

          return (
            <div
              key={ms.name}
              className={`${styles.card} ${ms.is_unlocked ? styles.cardUnlocked : ""}`}
            >
              <div className={styles.cardHeader}>
                <div
                  className={`${styles.iconContainer} ${ms.is_unlocked ? styles.iconContainerUnlocked : ""}`}
                >
                  <Icon size={24} />
                </div>
                {ms.is_unlocked && (
                  <div className={styles.statusContainer}>
                    <div className={styles.unlockedBadge}>UNLOCKED</div>
                    {ms.unlocked_at && (
                      <div className={styles.unlockedDate}>
                        {new Date(ms.unlocked_at).toLocaleDateString("en-GB")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3
                  className={`${styles.title} ${ms.is_unlocked ? styles.titleUnlocked : ""}`}
                >
                  {ms.title}
                </h3>
                <p
                  className={`${styles.description} ${ms.is_unlocked ? styles.descriptionUnlocked : ""}`}
                >
                  {ms.description}
                </p>
              </div>

              <div className={styles.progressContainer}>
                <div
                  className={`${styles.progressLabel} ${ms.is_unlocked ? styles.progressLabelUnlocked : ""}`}
                >
                  <span>Progress</span>
                  <span>
                    {ms.progress} / {ms.target} {ms.unit}
                  </span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={`${styles.progressBarFill} ${ms.is_unlocked ? styles.progressBarFillUnlocked : ""}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
