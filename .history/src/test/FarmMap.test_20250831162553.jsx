import { render, screen } from "@testing-library/react";
import FarmMap from "../components/FarmMap";
import axios from "axios";
import { vi, test, expect } from "vitest";

vi.mock("axios");

test("affiche la carte", () => {
  render(<FarmMap farms={[]} />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});

test("affiche les fermes", async () => {
  render(<FarmMap farms={[{ farmerName: "Ali" }]} />);
  expect(await screen.findByText("Ali")).toBeInTheDocument();
});

test("affiche 'No crops available'", async () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<FarmMap farms={[{ farmerName: "Test" }]} />);
  expect(await screen.findByText(/no crops available/i)).toBeInTheDocument();
});