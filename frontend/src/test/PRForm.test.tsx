import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PRForm } from "../components/PRForm/PRForm";

describe("PRForm", () => {
  const mockOnSubmit = vi.fn();

  it("renders with default title", () => {
    render(<PRForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/DESTROY WEAKNESS!/i)).toBeInTheDocument();
  });

  it("allows selecting an exercise", () => {
    render(<PRForm onSubmit={mockOnSubmit} />);
    const select = screen.getByLabelText(/EXERCISE/i);
    fireEvent.change(select, { target: { value: "Squat" } });
    expect(select).toHaveValue("Squat");
  });

  it("allows entering weight and reps", () => {
    render(<PRForm onSubmit={mockOnSubmit} />);
    const weightInput = screen.getByLabelText(/WEIGHT \(KG\)/i);
    const repsInput = screen.getByLabelText(/REPS/i);

    expect(weightInput).toBeInTheDocument();
    expect(repsInput).toBeInTheDocument();

    fireEvent.change(weightInput, { target: { value: "100" } });
    fireEvent.change(repsInput, { target: { value: "5" } });

    expect(weightInput).toHaveValue(100);
    expect(repsInput).toHaveValue(5);
  });

  it("calls onSubmit with correct data", async () => {
    render(<PRForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/EXERCISE/i), {
      target: { value: "Squat" },
    });
    fireEvent.change(screen.getByLabelText(/WEIGHT \(KG\)/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/REPS/i), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByText(/Log Record/i));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      exercise: "Squat",
      weight: 100,
      reps: 5,
    });
  });

  it("resets form after successful submission", async () => {
    render(<PRForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/WEIGHT \(KG\)/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/REPS/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/EXERCISE/i), {
      target: { value: "Squat" },
    });

    fireEvent.click(screen.getByText(/Log Record/i));

    await waitFor(() => {
      expect(screen.getByLabelText(/WEIGHT \(KG\)/i)).toHaveValue(null);
    });
  });
});
