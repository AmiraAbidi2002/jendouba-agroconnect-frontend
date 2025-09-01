import { render, screen } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { vi, test, expect } from "vitest";

vi.mock("../api/authService");
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null })
}));

test("affiche le titre Login", () => {
  render(<AuthPage />);
  expect(screen.getByText("Login")).toBeInTheDocument();
});

test("affiche le bouton Login", () => {
  render(<AuthPage />);
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});

test("affiche les champs email et password", () => {
  render(<AuthPage />);
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});