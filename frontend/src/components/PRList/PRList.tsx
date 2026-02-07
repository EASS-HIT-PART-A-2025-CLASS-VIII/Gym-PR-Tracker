import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Input } from "../Input/Input";
import { PRCard } from "../PRCard/PRCard";
import type { PR } from "../../types";
import styles from "./PRList.module.css";

interface PRListProps {
  prs: PR[];
  onDelete: (id: number) => void;
  onEdit: (pr: PR) => void;
  titleSize?: string;
  title?: string;
  showSearch?: boolean;
}

export function PRList({
  prs,
  onDelete,
  onEdit,
  titleSize = "2.5em",
  title = "History",
  showSearch = true,
}: PRListProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sortedPrs = [...prs].sort(
    (a, b) =>
      new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime(),
  );

  const filteredPrs = sortedPrs.filter((pr) =>
    pr.exercise.toLowerCase().includes(search.toLowerCase()),
  );

  const displayedPrs = showAll ? filteredPrs : filteredPrs.slice(0, 5);

  if (prs.length === 0) {
    return (
      <div className={styles.empty}>
        <Dumbbell size={48} className={styles.emptyIcon} />
        <p>No records yet. Go lift something heavy!</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.header} style={{ fontSize: titleSize }}>
        {title}
      </h3>

      {showSearch && (
        <div className={styles.searchContainer}>
          <Input
            label="Search History"
            labelStyle={{ fontSize: "1em", opacity: 0.7 }}
            placeholder="Filter by exercise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div
        className={styles.listContainer}
        style={{ minHeight: filteredPrs.length > 0 ? "auto" : "300px" }}
      >
        {displayedPrs.length === 0 ? (
          <p className={styles.noMatches}>No matching records found.</p>
        ) : (
          displayedPrs.map((pr) => (
            <PRCard
              key={pr.id}
              personalRecord={pr}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {filteredPrs.length > 5 && (
        <div className={styles.showMoreContainer}>
          <button
            onClick={() => setShowAll(!showAll)}
            className={styles.showMoreButton}
          >
            {showAll
              ? "Show Less"
              : `See More (${filteredPrs.length - 5} More)`}
          </button>
        </div>
      )}
    </div>
  );
}
