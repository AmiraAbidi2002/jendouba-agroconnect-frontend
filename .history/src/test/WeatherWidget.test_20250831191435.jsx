// src/test/WeatherWidget.test.jsx
import { test, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import WeatherWidget from "../components/WeatherWidget";
import * as weatherService from "../api/weatherService";

// On mocke la fonction getWeatherByCoords
vi.mock("../api/weatherService");

test("WeatherWidget affiche la météo correctement", async () => {
  // Données simulées
  const mockWeather = {
    current: {
      main: { temp: 25, humidity: 60, pressure: 1015 },
      weather: [{ description: "sunny" }],
      wind: { speed: 5 },
    },
    daily: Array.from({ length: 7 }, (_, i) => ({
      dt: Date.now() / 1000 + i * 86400,
      main: { temp: 20 + i },
      weather: [{ description: i % 2 === 0 ? "cloudy" : "clear sky" }],
    })),
  };

  // On fait en sorte que l'appel à l’API retourne ces données
  weatherService.getWeatherByCoords.mockResolvedValueOnce(mockWeather);

  render(<WeatherWidget />);

  // Vérifie que la température actuelle s'affiche
  expect(await screen.findByText(/25°C/i)).toBeInTheDocument();
  // Vérifie que la description "sunny" est affichée
  expect(await screen.findByText(/sunny/i)).toBeInTheDocument();

  // Vérifie aussi un des jours de prévision (par ex. "cloudy")
  await waitFor(() =>
    expect(screen.getByText(/cloudy/i)).toBeInTheDocument()
  );
});
