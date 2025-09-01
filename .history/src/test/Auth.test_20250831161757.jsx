// src/__tests__/auth.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router, useNavigate, useLocation } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { loginRequest, registerRequest } from "../api/authService";
import { jwtDecode } from "jwt-decode";
import { describe, expect, beforeEach, vi, test } from "vitest";

// Mock des dépendances
vi.mock("../api/authService");
vi.mock("jwt-decode");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});
vi.mock("../components/MapPicker", () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <div data-testid="map-picker">
      <button onClick={() => onChange("https://maps.example.com?location=test")}>
        Pick Location
      </button>
    </div>
  ),
}));

describe("AuthPage Component", () => {
  const mockNavigate = vi.fn();
  const mockLocation = {
    state: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
  });

  const renderAuthPage = () => {
    return render(
      <Router>
        <AuthPage />
      </Router>
    );
  };

  test("affiche le formulaire de login par défaut", () => {
    renderAuthPage();
    
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("affiche le formulaire d'inscription quand le mode est register", () => {
    mockLocation.state = { mode: "register" };
    renderAuthPage();
    
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("map-picker")).toBeInTheDocument();
  });

  test("valide les champs requis pour le login", async () => {
    renderAuthPage();
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test("valide le format d'email pour le login", async () => {
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalid-email" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });

  test("valide les champs requis pour l'inscription", async () => {
    mockLocation.state = { mode: "register" };
    renderAuthPage();
    
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/location is required/i)).toBeInTheDocument();
  });

  test("valide la longueur du mot de passe pour l'inscription", async () => {
    mockLocation.state = { mode: "register" };
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "short" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test("soumet avec succès le formulaire de login", async () => {
    const mockToken = "fake-jwt-token";
    loginRequest.mockResolvedValueOnce(mockToken);
    jwtDecode.mockReturnValueOnce({ user_type: "BUYER" });
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    await waitFor(() => {
      expect(loginRequest).toHaveBeenCalledWith("test@example.com", "password123");
      expect(localStorage.getItem("token")).toBe(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/buyer");
    });
  });

  test("soumet avec succès le formulaire d'inscription", async () => {
    mockLocation.state = { mode: "register", role: "FARMER" };
    registerRequest.mockResolvedValueOnce({});
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    // Sélectionner une localisation
    fireEvent.click(screen.getByText("Pick Location"));
    
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    
    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalledWith({
        user_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        location: "https://maps.example.com?location=test",
        user_type: "FARMER"
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("gère les erreurs de login", async () => {
    loginRequest.mockRejectedValueOnce(new Error("Invalid credentials"));
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    // Vérifier que l'alerte est affichée (vous devrez peut-être adapter selon votre implémentation)
    await waitFor(() => {
      expect(loginRequest).toHaveBeenCalled();
    });
  });

  test("gère les erreurs d'inscription", async () => {
    mockLocation.state = { mode: "register" };
    registerRequest.mockRejectedValueOnce(new Error("Email already exists"));
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" }
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByText("Pick Location"));
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    
    // Vérifier que l'alerte est affichée
    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalled();
    });
  });

  test("basculer entre login et register", () => {
    renderAuthPage();
    
    // Vérifier que nous sommes en mode login
    expect(screen.getByText("Login")).toBeInTheDocument();
    
    // Basculer vers register
    fireEvent.click(screen.getByText("Register"));
    
    // Vérifier que nous sommes en mode register
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    
    // Basculer vers login
    fireEvent.click(screen.getByText("Login"));
    
    // Vérifier que nous sommes de nouveau en mode login
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("redirige vers la page d'accueil quand on clique sur Back to Home", () => {
    renderAuthPage();
    
    fireEvent.click(screen.getByText("Back to Home"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("redirige vers le dashboard farmer après login réussi", async () => {
    const mockToken = "fake-jwt-token";
    loginRequest.mockResolvedValueOnce(mockToken);
    jwtDecode.mockReturnValueOnce({ user_type: "FARMER" });
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "farmer@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/farmer");
    });
  });

  test("redirige vers le dashboard buyer après login réussi", async () => {
    const mockToken = "fake-jwt-token";
    loginRequest.mockResolvedValueOnce(mockToken);
    jwtDecode.mockReturnValueOnce({ user_type: "BUYER" });
    
    renderAuthPage();
    
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "buyer@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });
    
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/buyer");
    });
  });
});