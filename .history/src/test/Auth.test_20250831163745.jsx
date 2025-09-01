import { render, screen, within } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { vi, test, expect } from "vitest";

vi.mock("../api/authService");
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null })
}));

// ------------------ LOGIN ------------------

test("affiche le titre Login sur la face front", () => {
  render(<AuthPage />);
  // On cible le h2 du login uniquement
  const loginTitle = screen.getAllByText("Login").find(
    el => el.tagName === "H2"
  );
  expect(loginTitle).toBeInTheDocument();
});

test("affiche le formulaire Login avec bouton et champs", () => {
  render(<AuthPage />);
  const loginForm = screen.getAllByText("Login").find(
    el => el.tagName === "H2"
  ).closest("form");

  expect(loginForm).toBeInTheDocument();

  const loginButton = within(loginForm).getByRole("button", { name: "Login" });
  expect(loginButton).toBeInTheDocument();

  const emailInput = within(loginForm).getByPlaceholderText("Email");
  const passwordInput = within(loginForm).getByPlaceholderText("Password");

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});

// ------------------ REGISTER ------------------

test("affiche le titre Register sur la face back", () => {
  render(<AuthPage />);
  const registerTitle = screen.getByText("Register", { selector: "h2" });
  expect(registerTitle).toBeInTheDocument();
});

test("affiche le formulaire Register avec bouton et champs", () => {
  render(<AuthPage />);
  const registerForm = screen.getByText("Register", { selector: "h2" }).closest("form");

  expect(registerForm).toBeInTheDocument();

  const registerButton = within(registerForm).getByRole("button", { name: "Register" });
  expect(registerButton).toBeInTheDocument();

  const nameInput = within(registerForm).getByPlaceholderText("Name");
  const emailInput = within(registerForm).getByPlaceholderText("Email");
  const passwordInput = within(registerForm).getByPlaceholderText("Password");

  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});

// ------------------ NAVIGATION ------------------

test("bouton Back to Home est présent sur les deux faces", () => {
  render(<AuthPage />);
  const backButtons = screen.getAllByText("Back to Home");
  expect(backButtons.length).toBeGreaterThanOrEqual(2);
  backButtons.forEach(button => {
    expect(button).toBeInTheDocument();
  });
});

// ------------------ LINKS ------------------

test("span Login/ Register cliquables", () => {
  render(<AuthPage />);
  const loginLink = screen.getAllByText("Login").find(el => el.tagName === "SPAN");
  const registerLink = screen.getAllByText("Register").find(el => el.tagName === "SPAN");

  expect(loginLink).toBeInTheDocument();
  expect(registerLink).toBeInTheDocument();
});
