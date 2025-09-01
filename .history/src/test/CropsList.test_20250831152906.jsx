// src/__tests__/CropForm.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm";
import { createCrop, updateCrop } from "../api/cropApi";
import {vi, test, expect, beforeEach, describe} from 'vitest';

// 🔹 On mock les API
vi.mock("../api/cropApi", () => ({
  createCrop: vi.fn(),
  updateCrop: vi.fn(),
}));

describe("CropForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  test("affiche le formulaire avec tous les champs", () => {
    render(<CropForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/crop name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/crop type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harvest date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/available for sale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/crop image/i)).toBeInTheDocument();
  });

  test("valide et soumet un nouveau crop", async () => {
    createCrop.mockResolvedValueOnce({}); // Mock success

    render(<CropForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/crop name/i), { target: { value: "Tomate" } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "3.5" } });

    // Date future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split("T")[0];
    fireEvent.change(screen.getByLabelText(/harvest date/i), { target: { value: dateStr } });

    fireEvent.click(screen.getByRole("button", { name: /create crop/i }));

    await waitFor(() => {
      expect(createCrop).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("affiche des erreurs de validation si champs vides", async () => {
    render(<CropForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /create crop/i }));

    expect(await screen.findByText(/crop name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/quantity must be greater than 0/i)).toBeInTheDocument();
    expect(await screen.findByText(/price must be greater than 0/i)).toBeInTheDocument();
    expect(await screen.findByText(/harvest date is required/i)).toBeInTheDocument();
  });

  test("soumet une mise à jour quand editingCrop est fourni", async () => {
    const editingCrop = {
      crop_id: 1,
      crop_name: "Blé",
      crop_type: "food crops",
      quantity: 20,
      price: 2,
      harvest_date: new Date().toISOString(),
      availability: true,
    };

    updateCrop.mockResolvedValueOnce({});

    render(
      <CropForm editingCrop={editingCrop} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    fireEvent.change(screen.getByLabelText(/crop name/i), { target: { value: "Blé modifié" } });
    fireEvent.click(screen.getByRole("button", { name: /update crop/i }));

    await waitFor(() => {
      expect(updateCrop).toHaveBeenCalledWith(1, expect.any(FormData));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("annuler appelle onCancel", () => {
    render(<CropForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
