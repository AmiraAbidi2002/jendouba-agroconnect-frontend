import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../farmer/CropForm";
import { test,vi,expect } from "vitest";

const createCrop = vi.fn(); // mock de la fonction de soumission

test("soumet le formulaire CropForm", async () => {
  render(<CropForm createCrop={createCrop} />);

  // Remplir les champs
  fireEvent.change(screen.getByLabelText(/Crop Name/i), { target: { value: "Tomato" } });
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: 10 } });
  fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: 5 } });
  fireEvent.change(screen.getByLabelText(/Harvest Date/i), { target: { value: "2025-09-01" } });
  fireEvent.click(screen.getByLabelText(/Available for sale/i));

  // Simuler l'envoi
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));

  // Attente que la fonction mockée soit appelée
  await waitFor(() => {
    expect(createCrop).toHaveBeenCalledTimes(1);
    expect(createCrop).toHaveBeenCalledWith(expect.objectContaining({
      crop_name: "Tomato",
      quantity: 10,
      price: 5,
      harvest_date: "2025-09-01",
      availability: true,
    }));
  });
});
