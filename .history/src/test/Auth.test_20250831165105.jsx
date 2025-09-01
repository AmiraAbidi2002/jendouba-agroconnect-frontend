// src/test/Auth.test.jsx
import { render, screen, within } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";

describe("AuthPage", () => {
  test("affiche le formulaire Login avec bouton et champs", () => {
    render(<AuthPage />);

    // On cible le formulaire Login via le heading
    const loginHeading = screen.getByRole("heading", { name: /login/i });
    const loginForm = loginHeading.closest("form");

    // Vérifie que les champs Email et Password existent
    const { getByPlaceholderText, getByRole } = within(loginForm);
    expect(getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Vérifie que le bouton Submit existe
    expect(getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("affiche le formulaire Register avec bouton et champs", () => {
    render(<AuthPage />);

    // On cible le formulaire Register via le heading
    const registerHeading = screen.getByRole("heading", { name: /register/i });
    const registerForm = registerHeading.closest("form");

    // Vérifie que les champs Name, Email et Password existent
    const { getByPlaceholderText, getByRole } = within(registerForm);
    expect(getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Vérifie que le bouton Submit existe
    expect(getByRole("button", { name: /register/i })).toBeInTheDocument();
  });
});
