// src/test/WeatherWidget.test.jsx
import { test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';

// Mock pour console.error pour éviter les logs d'erreur dans les tests
console.error = vi.fn();

// Serveur MSW mock avec la nouvelle API
const server = setupServer(
  http.get('http://localhost:8080/weather', ({ request }) => {
    // Vérifie que l'URL contient les paramètres attendus
    const url = new URL(request.url);
    
    if (url.searchParams.get('lat') === '36.5' && url.searchParams.get('lon') === '8.8') {
      return HttpResponse.json({ 
        temperature: 25, 
        condition: 'Sunny',
        humidity: 60,
        windSpeed: 15
      });
    }
    
    // Pour toute autre requête, retourner une erreur
    return new HttpResponse(null, { status: 404 });
  })
);

// Configurer MSW pour ignorer les requêtes non gérées au lieu de les rejeter
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('WeatherWidget affiche la météo correctement', async () => {
  render(<WeatherWidget />);
  
  // Attendre que le chargement disparaisse et que les données soient affichées
  await waitFor(() => {
    expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });
  
  // Vérifier que les données météo sont affichées
  expect(await screen.findByText(/25/i)).toBeInTheDocument();
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument();
});

test('WeatherWidget affiche une erreur en cas de problème API', async () => {
  // Simuler une erreur API
  server.use(
    http.get('http://localhost:8080/weather', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<WeatherWidget />);
  
  // Attendre que le message d'erreur s'affiche
  await waitFor(() => {
    expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
  }, { timeout: 3000 });
  
  // Vérifier qu'un message d'erreur est affiché
  expect(await screen.findByText(/erreur/i)).toBeInTheDocument();
});

test('WeatherWidget affiche un état de chargement initial', () => {
  render(<WeatherWidget />);
  
  // Vérifier que l'état de chargement est affiché initialement
  expect(screen.getByText(/chargement/i)).toBeInTheDocument();
});