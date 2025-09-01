// src/test/WeatherWidget.test.jsx
import { test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';

// Mock pour console.error
console.error = vi.fn();

// Serveur MSW mock - intercepte toutes les URLs contenant "weather"
const server = setupServer(
  http.get('*/weather*', () => {
    return HttpResponse.json({ 
      temperature: 25, 
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 15
    });
  })
);

// Configurer MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('WeatherWidget affiche la météo correctement', async () => {
  render(<WeatherWidget />);
  
  // Attendre que les données soient chargées
  await waitFor(() => {
    expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });
  
  // Vérifier que les données sont affichées
  expect(await screen.findByText(/25/i)).toBeInTheDocument();
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument();
});