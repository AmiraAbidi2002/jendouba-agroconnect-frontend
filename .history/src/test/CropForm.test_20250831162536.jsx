import { render, screen, fireEvent } from "@testing-library/react";
import CropForm from "../pages/farmer/CropForm";
import { createCrop } from "../api/cropApi";
import { vi, test, expect } from "vitest";

vi.mock("../api/cropApi");

test("affiche tous les champs du formulaire", () => {
  render(<CropForm />);
  expect(screen.getByLabelText(/crop name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
});

test("valide les champs requis", async () => {
  render(<CropForm />);
  fireEvent.click(screen.getByText(/create crop/i));
  expect(await screen.findByText(/crop name is required/i)).toBeInTheDocument();
});

test("soumet le formulaire", async () => {
  createCrop.mockResolvedValue({});
  render(<CropForm />);
  
  fireEvent.change(screen.getByLabelText(/crop name/i), {
    target: { value: "Tomato" }
  });
  
  fireEvent.click(screen.getByText(/create crop/i));
  expect(createCrop).toHaveBeenCalled();
});