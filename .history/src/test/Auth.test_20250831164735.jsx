import { render, screen } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { vi, test, expect } from "vitest";

vi.mock("../api/authService");
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null })
}));

test("le composant se render sans crash", () => {
  render(<AuthPage />);
  // Test très basique - juste vérifier que quelque chose s'affiche
  expect(screen.getByText(/account/i)).toBeInTheDocument();
});

test("a un bouton de soumission", () => {
  render(<AuthPage />);
  // Chercher par type de bouton
  const buttons = screen.getAllByRole("button");
  const submitButton = buttons.find(btn => btn.type === "submit");
  expect(submitButton).toBeInTheDocument();
});