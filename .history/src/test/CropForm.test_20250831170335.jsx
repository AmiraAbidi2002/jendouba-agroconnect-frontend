import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm";
import { createCrop } from "../api/cropApi";
import { vi, test, expect } from "vitest";

vi.mock("../api/cropApi");

test("soumet le formulaire", async () => {
  createCrop.mockResolvedValue({});

  render(<CropForm />);

  fireEvent.change(screen.getByLabelText(/crop name/i), {
    target: { value: "Tomato" }
  });
  fireEvent.change(screen.getByLabelText(/quantity/i), {
    target: { value: "10" }
  });
  fireEvent.change(screen.getByLabelText(/price/i), {
    target: { value: "5" }
  });
  fireEvent.change(screen.getByLabelText(/harvest date/i), {
    target: { value: "2025-09-01" }
  });
  fireEvent.change(screen.getByLabelText(/crop type/i), {
    target: { value: "food crops" }
  });
  fireEvent.click(screen.getByLabelText(/availability/i)); // coche la checkbox si nécessaire

  fireEvent.click(screen.getByText(/create crop/i));

  await waitFor(() => {
    expect(createCrop).toHaveBeenCalled();
  });
});
