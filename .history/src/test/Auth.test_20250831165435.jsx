import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { test, expect } from "vitest";
import userEvent from "@testing-library/user-event";

test("affiche le formulaire Login avec bouton et champs", () => {
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );

  // Vérifie que le formulaire Login est affiché
  const loginHeading = screen.getByRole("heading", { name: "Login" });
  expect(loginHeading).toBeInTheDocument();

  // Vérifie les champs du formulaire Login
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  const loginButton = screen.getByRole("button", { name: "Login" });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();

  // Vérifie le texte "No account?" spécifique au formulaire Login
  const noAccountText = screen.getByText(/no account/i);
  expect(noAccountText).toBeInTheDocument();
});

test("affiche le formulaire Register avec bouton et champs après clic", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );

  // Clique sur le lien "Register" pour afficher le formulaire d'inscription
  const registerLink = screen.getByText("Register");
  await user.click(registerLink);

  // Vérifie que le formulaire Register est affiché
  const registerHeading = screen.getByRole("heading", { name: "Register" });
  expect(registerHeading).toBeInTheDocument();

  // Vérifie les champs du formulaire Register
  const nameInput = screen.getByPlaceholderText("Name");
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  const registerButton = screen.getByRole("button", { name: "Register" });

  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();

  // Vérifie le texte "Already have an account?" spécifique au formulaire Register
  const haveAccountText = screen.getByText(/already have an account/i);
  expect(haveAccountText).toBeInTheDocument();
});

test("basculer entre les formulaires Login et Register", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );

  // Vérifie que le formulaire Login est affiché initialement
  expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByText(/no account/i)).toBeInTheDocument();

  // Clique sur le lien "Register" pour basculer vers le formulaire d'inscription
  const registerLink = screen.getByText("Register");
  await user.click(registerLink);

  // Vérifie que le formulaire Register est maintenant affiché
  expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();
  expect(screen.getByText(/already have an account/i)).toBeInTheDocument();

  // Clique sur le lien "Login" pour revenir au formulaire de connexion
  const loginLink = screen.getByText("Login");
  await user.click(loginLink);

  // Vérifie que le formulaire Login est à nouveau affiché
  expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByText(/no account/i)).toBeInTheDocument();
});