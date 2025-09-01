// src/__tests__/Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../context/AuthContext";
import { AuthProvider } from "../context/AuthContext"; 
import axios from "axios";

import {jest, test, describe, beforeEach, expect } from "vitest"

// 🔹 On mock axios pour éviter de vrais appels backend
jest.mock("axios");

describe("Login Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const setup = () => {
    return render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
  };

  test("affiche les champs email et mot de passe", () => {
    setup();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("login réussit et stocke le token", async () => {
    // 🔹 JWT factice
    const fakeToken = "fake.jwt.token";

    // 🔹 On mock la réponse backend
    axios.post.mockResolvedValueOnce({
      data: { token: fakeToken },
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "amira@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // 🔹 Attendre que le login soit terminé
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(fakeToken);
    });
  });

  test("affiche une erreur si le login échoue", async () => {
    axios.post.mockRejectedValueOnce(new Error("Invalid credentials"));

    setup();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  });
});
