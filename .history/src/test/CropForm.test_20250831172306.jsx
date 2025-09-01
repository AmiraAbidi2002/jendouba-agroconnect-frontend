import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm"; // vérifier chemin exact
import * as cropApi from "../api/cropApi";       // vérifier chemin exact
import { vi, test, expect, beforeEach } from "vitest";

vi.mock("../api/cropApi");  // Mock du module API
vi.stubGlobal('alert', vi.fn());

beforeEach(() => {
  vi.clearAllMocks();
});

test("soumet le formulaire CropForm", async () => {
  cropApi.createCrop.mockResolvedValueOnce({ success: true });

  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  render(<CropForm onSuccess={onSuccess} onCancel={onCancel} />);

  fireEvent.change(screen.getByLabelText(/Crop Name/i), { target: { value: "Tomato" } });
  fireEvent.change(screen.getByLabelText(/Crop Type/i), { target: { value: "food crops" } });
  fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: "10" } });
  fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: "5" } });
  fireEvent.change(screen.getByLabelText(/Harvest Date/i), { target: { value: "2025-09-01" } });

  fireEvent.click(screen.getByRole("button", { name: /Create Crop/i }));

  await waitFor(() => {
    expect(cropApi.createCrop).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
});
