import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { test,expect } from "vitest";

test("affiche le formulaire Login avec bouton et champs", () => {
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );

  // Récupère le h2 "Login"
  const loginFace = screen.getByRole("heading", { name: "Login" });
  expect(loginFace).toBeInTheDocument();

  // Cherche le form parent du titre ou du bouton "Login"
  const loginForm = loginFace.closest("div")?.querySelector("form");
  expect(loginForm).toBeInTheDocument();

  // Vérifie les champs et le bouton à l'intérieur du form
  const emailInput = within(loginForm).getByPlaceholderText("Email");
  const passwordInput = within(loginForm).getByPlaceholderText("Password");
  const loginButton = within(loginForm).getByRole("button", { name: "Login" });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
});

test("affiche le formulaire Register avec bouton et champs", () => {
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );

  // Récupère le h2 "Register"
  const registerFace = screen.getByRole("heading", { name: "Register" });
  expect(registerFace).toBeInTheDocument();

  // Cherche le form parent du titre
  const registerForm = registerFace.closest("div")?.querySelector("form");
  expect(registerForm).toBeInTheDocument();

  // Vérifie les champs et le bouton à l'intérieur du form
  const nameInput = within(registerForm).getByPlaceholderText("Name");
  const emailInput = within(registerForm).getByPlaceholderText("Email");
  const passwordInput = within(registerForm).getByPlaceholderText("Password");
  const registerButton = within(registerForm).getByRole("button", { name: "Register" });

  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
});
