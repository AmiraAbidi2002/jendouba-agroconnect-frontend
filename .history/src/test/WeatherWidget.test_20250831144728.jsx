// src/__tests__/WeatherWidget.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import WeatherWidget from "../components/WeatherWidget";
import { getWeatherByCoords } from "../api/weatherService";

import { describe, expect, beforeEach, jest, test } from "vitest"; 

// 🔹 On mock le service météo
jest.mock("../api/weatherService");

const mockWeatherData = {
  current: {
    main: { temp: 22, humidity: 60, pressure: 1012 },
    weather: [{ description: "clear sky" }],
    wind: { speed: 3 },
  },
  daily: Array.from({ length: 7 }, (_, i) => ({
    dt: Date.now() / 1000 + i * 86400,
    weather: [{ description: i % 2 === 0 ? "cloudy" : "sunny" }],
    main: { temp: 20 + i },
  })),
};

describe("WeatherWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("affiche le loader au début", async () => {
    getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
    render(<WeatherWidget />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("affiche les données météo après chargement", async () => {
    getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
    render(<WeatherWidget />);

    expect(await screen.findByText(/Agricultural Weather Forecast/i)).toBeInTheDocument();
    expect(await screen.findByText(/Today/i)).toBeInTheDocument();
    expect(await screen.findByText(/22°C/i)).toBeInTheDocument();
  });

  test("affiche un message d'erreur si la requête échoue", async () => {
    getWeatherByCoords.mockRejectedValueOnce(new Error("API error"));
    render(<WeatherWidget />);

    expect(await screen.findByText(/Failed to load weather data/i)).toBeInTheDocument();
  });

  test("permet de minimiser et maximiser la section Today", async () => {
    getWeatherByCoords.mockResolvedValueOnce(mockWeatherData);
    render(<WeatherWidget />);

    const button = await screen.findByRole("button");
    fireEvent.click(button);

    // Après minimisation, la température ne doit plus être affichée
    await waitFor(() => {
      expect(screen.queryByText(/22°C/i)).not.toBeInTheDocument();
    });

    // Re-maximiser
    fireEvent.click(button);
    expect(await screen.findByText(/22°C/i)).toBeInTheDocument();
  });
});
