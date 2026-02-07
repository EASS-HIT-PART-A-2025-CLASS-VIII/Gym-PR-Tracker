import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PRList } from "../components/PRList/PRList";
import type { PR } from "../types";

const mockPrs: PR[] = [
  {
    id: 1,
    exercise: "Squat",
    weight: 100,
    reps: 5,
    performed_at: "2024-02-01T10:00:00Z",
  },
  {
    id: 2,
    exercise: "Bench",
    weight: 80,
    reps: 5,
    performed_at: "2024-02-05T10:00:00Z",
  },
  {
    id: 3,
    exercise: "Deadlift",
    weight: 120,
    reps: 5,
    performed_at: "2024-02-02T10:00:00Z",
  },
  {
    id: 4,
    exercise: "OHP",
    weight: 50,
    reps: 5,
    performed_at: "2024-02-04T10:00:00Z",
  },
  {
    id: 5,
    exercise: "Pull Ups",
    weight: 20,
    reps: 5,
    performed_at: "2024-02-03T10:00:00Z",
  },
  {
    id: 6,
    exercise: "Rows",
    weight: 70,
    reps: 5,
    performed_at: "2024-02-06T10:00:00Z",
  },
];

describe("PRList", () => {
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  it("renders a list of PRs", () => {
    render(
      <PRList
        prs={mockPrs.slice(0, 2)}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );
    expect(screen.getByText("Squat")).toBeInTheDocument();
    expect(screen.getByText("Bench")).toBeInTheDocument();
  });

  it("sorts PRs by date descending (newest first)", () => {
    render(
      <PRList prs={mockPrs} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );
    const items = screen.getAllByText(
      /(Squat|Bench|Deadlift|OHP|Pull Ups|Rows)/i,
    );
    // Newest is id 6 (Feb 6), then id 2 (Feb 5), etc.
    expect(items[0]).toHaveTextContent("Rows");
    expect(items[1]).toHaveTextContent("Bench");
  });

  it("limits displayed PRs to 5 by default", () => {
    render(
      <PRList prs={mockPrs} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );
    const prElements = screen.getAllByText(/kg/i);
    expect(prElements).toHaveLength(5);
  });

  it("shows 'See More' button when there are more than 5 PRs", () => {
    render(
      <PRList prs={mockPrs} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );
    expect(screen.getByText(/See More/i)).toBeInTheDocument();
  });

  it("displays all PRs when 'See More' is clicked", () => {
    render(
      <PRList prs={mockPrs} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );
    fireEvent.click(screen.getByText(/See More/i));
    const prElements = screen.getAllByText(/kg/i);
    expect(prElements).toHaveLength(6);
  });

  it("filters PRs based on search input", () => {
    render(
      <PRList prs={mockPrs} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
    );
    const searchInput = screen.getByPlaceholderText(/Filter by exercise/i);
    fireEvent.change(searchInput, { target: { value: "Squat" } });

    expect(screen.getByText("Squat")).toBeInTheDocument();
    expect(screen.queryByText("Bench")).not.toBeInTheDocument();
  });
});
