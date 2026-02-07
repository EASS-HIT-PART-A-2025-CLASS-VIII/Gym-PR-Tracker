import { useEffect, useState } from "react";
import { api } from "./api";
import type { PR, PRCreate, PRUpdate } from "./types";
import { Milestones } from "./components/Milestones/Milestones";
import { PRForm } from "./components/PRForm/PRForm";
import { PRList } from "./components/PRList/PRList";
import { LoginRegister } from "./components/LoginRegister/LoginRegister";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { WorkoutBuilder } from "./components/WorkoutBuilder/WorkoutBuilder";
import { PopupDialog } from "./components/PopupDialog/PopupDialog";
import "./App.css";

function App() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [editingPR, setEditingPR] = useState<PR | null>(null);
  const [deletingPRId, setDeletingPRId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [username, setUsername] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPrs([]);
    setUsername("");
  };

  const fetchPRs = async () => {
    try {
      const data = await api.getAll();
      setPrs(data);
    } catch (error: any) {
      console.error("Error fetching PRs:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Fetch PRs when token changes
  useEffect(() => {
    if (token) {
      fetchPRs();
      try {
        // Simple JWT decode to get username
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.sub) {
          setUsername(payload.sub);
        }
      } catch (e) {
        console.error("Failed to decode token for username", e);
      }
    } else {
      setUsername("");
    }
  }, [token]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddPR = async (newPR: PRCreate) => {
    try {
      await api.create(newPR);
      await fetchPRs(); // Refresh list
    } catch (error: any) {
      console.error("Error adding PR:", error);
      const detail = error.response?.data?.detail || error.message;
      const status = error.response?.status || "Network Error";
      alert(
        `Failed to save PR (${status}).\n\nDetail: ${detail}\n\nPlease check if the exercise name, weight, and reps are valid.`,
      );
      if (status === 401) {
        handleLogout();
      }
    }
  };

  const handleEdit = (pr: PR) => {
    setEditingPR(pr);
  };

  const handleUpdate = async (data: PRCreate) => {
    if (!editingPR) return;
    try {
      const updateData: PRUpdate = {
        exercise: data.exercise,
        weight: data.weight,
        reps: data.reps,
      };
      await api.update(editingPR.id, updateData);
      setEditingPR(null);
      await fetchPRs();
    } catch (error) {
      console.error("Error updating PR:", error);
      alert("Failed to update PR");
    }
  };

  const handleDelete = (id: number) => {
    setDeletingPRId(id);
  };

  const confirmDelete = async () => {
    if (deletingPRId === null) return;
    try {
      await api.delete(deletingPRId);
      setPrs(prs.filter((pr) => pr.id !== deletingPRId));
      setDeletingPRId(null);
    } catch (error) {
      alert("Failed to delete PR");
    }
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === "dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(`${sectionId}-section`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (!token) {
    return <LoginRegister onLogin={(newToken) => setToken(newToken)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        username={username}
      />

      <main className="main-content">
        <div
          className="main-container"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "60px",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Gym PR Tracker</h1>

          <section id="new-pr-section">
            <PRForm onSubmit={handleAddPR} />
          </section>

          <section id="history-section">
            <PRList prs={prs} onDelete={handleDelete} onEdit={handleEdit} />
          </section>

          <section id="milestones-section">
            <Milestones prs={prs} />
          </section>

          <section id="workout-builder-section">
            <WorkoutBuilder />
          </section>

          <PopupDialog
            isOpen={editingPR !== null}
            title="Edit Personal Record"
            onCancel={() => setEditingPR(null)}
          >
            {editingPR && (
              <PRForm
                initialValues={editingPR}
                onSubmit={handleUpdate}
                onCancel={() => setEditingPR(null)}
              />
            )}
          </PopupDialog>

          <PopupDialog
            isOpen={deletingPRId !== null}
            title="Confirm Deletion"
            message="Are you sure you want to delete this PR? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={() => setDeletingPRId(null)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
