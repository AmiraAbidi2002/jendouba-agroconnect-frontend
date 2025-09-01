import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm";
import { createCrop } from "../api/cropApi";
import { vi, test, expect } from "vitest";

vi.mock("../api/cropApi"); // Mock du module entier

test("soumet le formulaire", async () => {
  createCrop.mockResolvedValue({}); // Mock de la réponse

  render(<CropForm />);

  // Remplissage du formulaire
  fireEvent.change(screen.getByLabelText(/crop name/i), {
    target: { value: "Tomato" }
  });

  fireEvent.change(screen.getByLabelText(/quantity/i), {
    target: { value: "10" }
  });

  // Clic sur le bouton pour soumettre
  fireEvent.click(screen.getByText(/create crop/i));

  // Attente que la fonction mockée soit appelée
  await waitFor(() => {
    expect(createCrop).toHaveBeenCalled();
  });
});
