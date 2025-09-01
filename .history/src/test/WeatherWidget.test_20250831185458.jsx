// src/test/WeatherWidget.test.jsx
import { test,expect,beforeAll,afterAll,afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';

// Serveur MSW mock
const server = setupServer(
  rest.get('http://localhost:8080/api/weather', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ temperature: 25, condition: 'Sunny' })
    );
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
