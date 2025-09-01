import { render, screen } from "@testing-library/react";
import WeatherWidget from "../components/WeatherWidget";
import { getWeatherByCoords } from "../api/weatherService";
import { vi, test, expect } from "vitest";

vi.mock("../api/weatherService");

test("affiche le loader initial", () => {
  render(<WeatherWidget />);
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("affiche les données météo", async () => {
  getWeatherByCoords.mockResolvedValue({ current: { main: { temp: 22 } } });
  render(<WeatherWidget />);
  expect(await screen.findByText("22°C")).toBeInTheDocument();
});

test("affiche une erreur", async () => {
  getWeatherByCoords.mockRejectedValue(new Error("API error"));
  render(<WeatherWidget />);
  expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
});