// src/test/WeatherWidget.test.jsx
import { test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';

// Serveur MSW mock avec la nouvelle API
const server = setupServer(
  http.get('http://localhost:8080/weather', () => {
    return HttpResponse.json({ 
      temperature: 25, 
      condition: 'Sunny' 
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('WeatherWidget affiche la météo correctement', async () => {
  render(<WeatherWidget />);
  expect(await screen.findByText(/25/i)).toBeInTheDocument();
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument();
});