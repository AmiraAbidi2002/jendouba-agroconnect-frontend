// src/test/WeatherWidget.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';
import { test,expect,beforeAll,afterAll,afterEach } from 'vitest';

// =====================
// Mock du serveur pour les tests
const server = setupServer(
  rest.get('http://localhost:8080/weather', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ temperature: 25, condition: 'Sunny' })
    );
  })
);

// =====================
// Lifecycle du serveur MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =====================
// Tests
test('WeatherWidget affiche la météo correctement', async () => {
  render(<WeatherWidget />);
  
  // On attend que l'élément avec la température apparaisse
  const tempElement = await screen.findByText(/25/i);
  expect(tempElement).toBeInTheDocument();

  // On peut aussi tester l'affichage de la condition
  const conditionElement = await screen.findByText(/Sunny/i);
  expect(conditionElement).toBeInTheDocument();
});
