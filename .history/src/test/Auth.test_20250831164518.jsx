import { render, screen, fireEvent } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { vi, test, expect } from "vitest";

vi.mock("../api/authService");
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null })
}));

test("peut taper dans les champs", () => {
  render(<AuthPage />);
  
  // Prendre le premier champ email
  const emailInput = screen.getAllByPlaceholderText("Email")[0];
  fireEvent.change(emailInput, { target: { value: "test@test.com" } });
  
  expect(emailInput.value).toBe("test@test.com");
});

test("a un bouton pour basculer entre login/register", () => {
  render(<AuthPage />);
  
  // Le texte "Register" existe (pour basculer vers l'inscription)
  expect(screen.getByText("Register")).toBeInTheDocument();
});