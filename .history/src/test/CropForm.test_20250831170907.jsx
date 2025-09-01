import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm"; // chemin vers ton composant
import "@testing-library/jest-dom";
import { test,vi,expect } from "vitest";

test("soumet le formulaire CropForm", async () => {
  // Création du mock pour la fonction createCrop
  const createCrop = vi.fn();

  // On rend le composant avec la prop mockée
  render(<CropForm createCrop={createCrop} />);

  // Remplissage des champs requis
  fireEvent.change(screen.getByLabelText(/crop name/i), {
    target: { value: "Tomato" },
  });

  fireEvent.change(screen.getByLabelText(/crop type/i), {
    target: { value: "food crops" },
  });

  fireEvent.change(screen.getByLabelText(/quantity/i), {
    target: { value: "10" },
  });

  fireEvent.change(screen.getByLabelText(/price/i), {
    target: { value: "5" },
  });

  fireEvent.change(screen.getByLabelText(/harvest date/i), {
    target: { value: "2025-09-01" },
  });

  // Coche la checkbox "Available for sale"
  fireEvent.click(screen.getByLabelText(/available for sale/i));

  // Soumission du formulaire
  fireEvent.click(screen.getByText(/create crop/i));

  // Attente que la fonction mockée soit appelée
  await waitFor(() => {
    expect(createCrop).toHaveBeenCalled();
  });
});
