import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import WeatherWidget from '../components/WeatherWidget';
import { test, expect, beforeAll,afterAll,afterEach } from 'vitest';

// Setup du serveur MSW
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

// Avant tous les tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('affiche le loader initial', () => {
  render(<WeatherWidget />);
  const loader = screen.getByTestId('loader');
  expect(loader).toBeInTheDocument();
});

test('affiche les données météo', async () => {
  render(<WeatherWidget />);
  expect(await screen.findByText(/22°C/)).toBeInTheDocument();
  expect(screen.getByText(/sunny/i)).toBeInTheDocument();
});

test('affiche une erreur si fetch échoue', async () => {
  server.use(
    rest.get('http://localhost:8080/weather', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  render(<WeatherWidget />);
  expect(await screen.findByText(/Weather fetch error/i)).toBeInTheDocument();
});
