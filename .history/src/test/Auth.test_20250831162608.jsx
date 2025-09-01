import { render, screen, fireEvent } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { loginRequest } from "../api/authService";
import { vi, test, expect } from "vitest";

vi.mock("../api/authService");
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null })
}));

test("affiche le formulaire de login", () => {
  render(<AuthPage />);
  expect(screen.getByText("Login")).toBeInTheDocument();
});

test("valide l'email requis", async () => {
  render(<AuthPage />);
  fireEvent.click(screen.getByText(/login/i));
  expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
});

test("connecte l'utilisateur", async () => {
  loginRequest.mockResolvedValue("fake-token");
  render(<AuthPage />);
  
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@test.com" }
  });
  
  fireEvent.click(screen.getByText(/login/i));
  expect(loginRequest).toHaveBeenCalled();
});