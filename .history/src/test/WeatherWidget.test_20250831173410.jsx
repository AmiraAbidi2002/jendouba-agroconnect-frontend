// src/test/WeatherWidget.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';
import { beforeAll,afterAll,afterEach,expect,test } from 'vitest';

// =====================
// Serveur MSW pour simuler l'API météo
// =====================
const server = setupServer(
  rest.get('http://localhost:8080/weather', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        current: { main: { temp: 22 }, weather: [{ description: 'sunny' }] },
      })
    );
  })
);

// =====================
// Setup / Teardown MSW
// =====================
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =====================
// Tests
// =====================

// Test loader initial
test('affiche le loader initial', () => {
  render(<WeatherWidget />);
  const loader = screen.getByTestId('loader'); // Assure-toi que ton loader a data-testid="loader"
  expect(loader).toBeInTheDocument();
});

// Test affichage des données météo
test('affiche les données météo', async () => {
  render(<WeatherWidget />);

  // On attend que la température s'affiche
  const temp = await screen.findByText(/22°C/);
  expect(temp).toBeInTheDocument();

  // On attend que la description météo s'affiche
  const desc = screen.getByText(/sunny/i);
  expect(desc).toBeInTheDocument();
});

// Test affichage d'erreur si fetch échoue
test('affiche une erreur si fetch échoue', async () => {
  // On simule une erreur serveur
  server.use(
    rest.get('http://localhost:8080/weather', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  render(<WeatherWidget />);

  const errorMessage = await screen.findByText(/Weather fetch error/i);
  expect(errorMessage).toBeInTheDocument();
});
