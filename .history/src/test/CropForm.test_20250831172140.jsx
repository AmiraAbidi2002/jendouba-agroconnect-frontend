import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../farmer/CropForm";
import * as cropApi from "../../api/cropApi"; // importer tout le module pour mock

import { vi, test, expect, beforeEach } from "vitest";

// Mocker createCrop et updateCrop
vi.mock("../../api/cropApi");

beforeEach(() => {
  // Réinitialiser les mocks avant chaque test
  vi.clearAllMocks();
});

test("soumet le formulaire CropForm", async () => {
  // Mock createCrop pour qu'il résolve immédiatement
  cropApi.createCrop.mockResolvedValueOnce({ success: true });

  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  render(<CropForm onSuccess={onSuccess} onCancel={onCancel} />);

  // Remplir le formulaire
  fireEvent.change(screen.getByLabelText(/Crop Name/i), {
    target: { value: "Tomato" },
  });
  fireEvent.change(screen.getByLabelText(/Crop Type/i), {
    target: { value: "food crops" },
  });
  fireEvent.change(screen.getByLabelText(/Quantity/i), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByLabelText(/Price/i), {
    target: { value: "5" },
  });
  fireEvent.change(screen.getByLabelText(/Harvest Date/i), {
    target: { value: "2025-09-01" },
  });

  // Cliquer sur submit
  fireEvent.click(screen.getByRole("button", { name: /Create Crop/i }));

  // Attendre que le mock soit appelé
  await waitFor(() => {
    expect(cropApi.createCrop).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
});
