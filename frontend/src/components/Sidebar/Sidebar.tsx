import { History, Trophy, PlusCircle, LogOut, Dumbbell } from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onNavigate: (section: string) => void;
  onLogout: () => void;
  username: string | null;
}

export function Sidebar({ onNavigate, onLogout, username }: SidebarProps) {
  const menuItems = [
    { id: "new-pr", label: "Add New PR", icon: PlusCircle },
    { id: "history", label: "History", icon: History },
    { id: "milestones", label: "Milestones", icon: Trophy },
    { id: "workout-builder", label: "Your AI Coach", icon: Dumbbell },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logo}>
          GYM PR <span className={styles.logoHighlight}>TRACKER</span>
        </h2>
        {username && <div className={styles.username}>Welcome, {username}</div>}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={styles.menuButton}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.logoutContainer}>
        <button onClick={onLogout} className={styles.logoutButton}>
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
