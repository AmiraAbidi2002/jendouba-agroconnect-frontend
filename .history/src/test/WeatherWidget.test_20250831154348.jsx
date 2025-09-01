// WeatherWidget.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import WeatherWidget from "../farmer/WeatherWidget";

describe("WeatherWidget component", () => {
  const mockWeather = {
    temperature: 22,
    description: "Sunny",
    humidity: 50,
    windSpeed: 10,
  };

  test("renders loader when loading", () => {
    render(<WeatherWidget weather={null} loading={true} />);
    
    // L'élément loader doit avoir role="status" pour être détecté
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
  });

  test("renders weather data when available", () => {
    render(<WeatherWidget weather={mockWeather} loading={false} />);

    // Vérifier les éléments de météo
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText("Sunny")).toBeInTheDocument();
    expect(screen.getByText("Humidity: 50%")).toBeInTheDocument();
    expect(screen.getByText("Wind: 10 km/h")).toBeInTheDocument();
  });
});
