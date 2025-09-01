import { render, screen } from '@testing-library/react';
import WeatherWidget from '../components/WeatherWidget';
import { test, expect } from 'vitest';

test('renders weather widget with forecast', async () => {
  const mockData = {
    daily: [
      { dt: 1690000000, temp: { day: 30 }, weather: [{ main: 'Clear' }] },
      { dt: 1690086400, temp: { day: 28 }, weather: [{ main: 'Rain' }] },
    ]
  };

  render(<WeatherWidget data={mockData} />);

  expect(await screen.findByText(/Clear/i)).toBeInTheDocument();
  expect(screen.getByText(/Rain/i)).toBeInTheDocument();
});
