// src/test/WeatherWidget.test.jsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import WeatherWidget from "../components/WeatherWidget";
import { server } from "./__mocks__/server";
//import { rest } from "msw";

// --- Démarrage du serveur MSW ---
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Optionnel : override du handler si besoin ---
// server.use(
//   rest.get("http://localhost:8080/weather", (req, res, ctx) => {
//     return res(
//       ctx.status(200),
//       ctx.json({ temperature: 25, condition: "Sunny", forecast: [{ day: "Mon", temperature: 25, condition: "Sunny" }, { day: "Tue", temperature: 26, condition: "Cloudy" }] })
//     );
//   })
// );

// --- Test principal ---
test("WeatherWidget affiche la météo correctement", async () => {
  render(<WeatherWidget />);

  // Vérifie que le bloc "Today" est bien présent
  const today = await screen.findByText(/today/i, {}, { timeout: 2000 });
  expect(today).toBeInTheDocument();

  // Vérifie la température
  const todayContainer = today.closest("div");
  expect(within(todayContainer).getByText(/25°C/i)).toBeInTheDocument();

  // Vérifie la condition météo
  expect(await screen.findByText(/sunny/i)).toBeInTheDocument();

  // Vérifie qu'une prévision future est affichée
  expect(await screen.findByText(/Tue/i)).toBeInTheDocument();
});
