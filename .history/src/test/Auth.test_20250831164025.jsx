import { render, within } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import {test, expect} from "vitest";

test("affiche le formulaire Login avec bouton et champs", () => {
  render(<AuthPage />);
  // On cible la face front
  const loginFace = document.querySelector(".auth-face.auth-front");
  expect(loginFace).toBeInTheDocument();

  const loginForm = within(loginFace).getByRole("form"); // récupère le formulaire à l'intérieur
  expect(loginForm).toBeInTheDocument();

  const emailInput = within(loginForm).getByPlaceholderText("Email");
  const passwordInput = within(loginForm).getByPlaceholderText("Password");
  const loginButton = within(loginForm).getByRole("button", { name: "Login" });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
});

test("affiche le formulaire Register avec bouton et champs", () => {
  render(<AuthPage />);
  const registerFace = document.querySelector(".auth-face.auth-back");
  expect(registerFace).toBeInTheDocument();

  const registerForm = within(registerFace).getByRole("form");
  expect(registerForm).toBeInTheDocument();

  const nameInput = within(registerForm).getByPlaceholderText("Name");
  const emailInput = within(registerForm).getByPlaceholderText("Email");
  const passwordInput = within(registerForm).getByPlaceholderText("Password");
  const registerButton = within(registerForm).getByRole("button", { name: "Register" });

  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
});
