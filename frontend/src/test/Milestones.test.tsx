import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Milestones } from "../components/Milestones/Milestones";
import { api } from "../api";

// Mock the API
vi.mock("../api", () => ({
  api: {
    getMilestones: vi.fn(),
  },
}));

const mockMilestones = [
  {
    name: "novice",
    is_unlocked: true,
    unlocked_at: "2024-02-01T10:00:00Z",
    progress: 1,
    target: 1,
    title: "Novice Lifter",
    description: "Log your first PR",
    unit: "PR",
  },
  {
    name: "chest-pounder",
    is_unlocked: false,
    unlocked_at: null,
    progress: 80,
    target: 100,
    title: "Chest Pounder",
    description: "Bench Press 100kg",
    unit: "kg",
  },
];

describe("Milestones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    (api.getMilestones as any).mockReturnValue(new Promise(() => {}));
    render(<Milestones prs={[]} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders milestones from API", async () => {
    (api.getMilestones as any).mockResolvedValue(mockMilestones);
    render(<Milestones prs={[]} />);

    await waitFor(() => {
      expect(screen.getByText("Novice Lifter")).toBeInTheDocument();
      expect(screen.getByText("Chest Pounder")).toBeInTheDocument();
    });
  });

  it("displays correct progress and unlocked state", async () => {
    (api.getMilestones as any).mockResolvedValue(mockMilestones);
    render(<Milestones prs={[]} />);

    await waitFor(() => {
      // Novice is unlocked
      expect(screen.getByText("UNLOCKED")).toBeInTheDocument();
      expect(screen.getByText("1 / 1 PR")).toBeInTheDocument();

      // Chest pounder is locked
      expect(screen.getByText(/80.*100.*kg/i)).toBeInTheDocument();

      // Check for locked opacity on the card
      // Check for locked opacity on the card
      // (Style check removed due to CSS modules not loading in jsdom)
    });
  });

  it("refetches milestones when prs prop changes", async () => {
    (api.getMilestones as any).mockResolvedValue(mockMilestones);
    const { rerender } = render(<Milestones prs={[]} />);

    await waitFor(() => expect(api.getMilestones).toHaveBeenCalledTimes(1));

    // Update prs prop
    rerender(
      <Milestones
        prs={[
          { id: 1, exercise: "Squat", weight: 100, reps: 5, performed_at: "" },
        ]}
      />,
    );

    await waitFor(() => expect(api.getMilestones).toHaveBeenCalledTimes(2));
  });
});
