import { render, screen } from "@testing-library/react";
import { test, vi, expect, beforeAll, afterAll, afterEach } from "vitest";
import WeatherWidget from "../components/WeatherWidget";
import { setupServer } from "msw/node";
import { rest } from "msw";

// =====================
// Mock MSW pour les requêtes
// =====================
const server = setupServer(
  rest.get("http://localhost:8080/weather", (req, res, ctx) => {
    // On retourne des données météo simulées
    return res(
      ctx.status(200),
      ctx.json({
        current: { main: { temp: 22 }, weather: [{ description: "sunny" }] },
      })
    );
  })
);

// Démarrage et arrêt du serveur MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =====================
// Mock du service interne
// =====================
const mockGetWeatherByCoords = vi.fn();

vi.mock("../services/weatherService", () => ({
  getWeatherByCoords: (...args) => mockGetWeatherByCoords(...args),
}));

// =====================
// Tests
// =====================
test("affiche le loader initial", () => {
  // Promesse qui ne se résout pas encore pour simuler le loading
  mockGetWeatherByCoords.mockReturnValue(new Promise(() => {}));
  render(<WeatherWidget />);

  // Vérifie que le loader apparaît
  const loader = screen.getByTestId("loader");
  expect(loader).toBeInTheDocument();
});

test("affiche les données météo", async () => {
  // Valeurs simulées pour le fetch réussi
  mockGetWeatherByCoords.mockResolvedValue({
    current: { main: { temp: 22 }, weather: [{ description: "sunny" }] },
  });

  render(<WeatherWidget />);

  // On attend que la température et la description s'affichent
  expect(await screen.findByText(/22°C/)).toBeInTheDocument();
  expect(await screen.findByText(/sunny/i)).toBeInTheDocument();
});

test("affiche une erreur si fetch échoue", async () => {
  mockGetWeatherByCoords.mockRejectedValue(new Error("API error"));

  render(<WeatherWidget />);

  // On attend le message d'erreur
  expect(await screen.findByText(/Weather fetch error/i)).toBeInTheDocument();
});
