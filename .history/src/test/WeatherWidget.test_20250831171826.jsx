import { render, screen, waitFor } from "@testing-library/react";
import { test, vi, expect } from "vitest";
import WeatherWidget from "../components/WeatherWidget";

// Mock de la fonction getWeatherByCoords
const mockGetWeatherByCoords = vi.fn();

// On mock le module réel s’il existe
vi.mock("../services/weatherService", () => ({
  getWeatherByCoords: (...args) => mockGetWeatherByCoords(...args),
}));

test("affiche le loader initial", () => {
  // Avant que la promesse ne résolve, le loader doit apparaître
  mockGetWeatherByCoords.mockReturnValue(new Promise(() => {}));
  render(<WeatherWidget />);
  const loader = screen.getByTestId("loader"); // on ajoute data-testid="loader" dans ton composant
  expect(loader).toBeInTheDocument();
});

test("affiche les données météo", async () => {
  mockGetWeatherByCoords.mockResolvedValue({
    current: { main: { temp: 22 }, weather: [{ description: "sunny" }] },
  });

  render(<WeatherWidget />);

  // On attend que la température s'affiche
  expect(await screen.findByText(/22°C/)).toBeInTheDocument();
  expect(screen.getByText(/sunny/i)).toBeInTheDocument();
});

test("affiche une erreur si fetch échoue", async () => {
  mockGetWeatherByCoords.mockRejectedValue(new Error("API error"));

  render(<WeatherWidget />);
  expect(await screen.findByText(/Weather fetch error/i)).toBeInTheDocument();
});
