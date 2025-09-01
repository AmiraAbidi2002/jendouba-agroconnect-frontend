import { render, screen, fireEvent } from "@testing-library/react";
import { test, vi, expect } from "vitest";
import CropForm from "../pages/farmer/CropForm";

// Mock de la fonction createCrop
const createCrop = vi.fn();

test("soumet le formulaire CropForm", () => {
  render(<CropForm createCrop={createCrop} />);

  // Remplir les champs
  fireEvent.change(screen.getByLabelText(/Crop Name/i), { target: { value: "Tomato" } });
  fireEvent.change(screen.getByLabelText(/Crop Type/i), { target: { value: "food crops" } });
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: 10 } });
  fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: 5 } });
  fireEvent.change(screen.getByLabelText(/Harvest Date/i), { target: { value: "2025-09-01" } });

  // Cliquer sur le bouton submit
  fireEvent.click(screen.getByRole("button", { name: /create crop/i }));

  // Vérifier que la fonction mockée a été appelée
  expect(createCrop).toHaveBeenCalled();
});
