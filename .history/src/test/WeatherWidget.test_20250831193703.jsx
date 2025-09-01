// src/test/WeatherWidget.test.jsx
import { test, expect, jest } from "vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";

// Import le mock http
import { http } from "msw";
import WeatherWidget from "../components/WeatherWidget";

// --- On patch le service pour utiliser le mock ---
jest.mock("../api/weatherService", () => ({
  getWeatherByCoords: (lat, lon) => http.get(`http://localhost:8080/weather?lat=${lat}&lon=${lon}`),
}));

test("WeatherWidget affiche la météo correctement", async () => {
  render(<WeatherWidget />);

  const today = await screen.findByText(/today/i, {}, { timeout: 2000 });
  expect(today).toBeInTheDocument();

  const todayContainer = today.closest("div");
  expect(within(todayContainer).getByText(/25°C/i)).toBeInTheDocument();

  expect(await screen.findByText(/sunny/i)).toBeInTheDocument();
  expect(await screen.findByText(/Tue/i)).toBeInTheDocument();
});
