import { render, screen } from '@testing-library/react';
import MapView from '../components/FarmMap';
import { test, expect } from 'vitest';

test('renders map container', () => {
  const farms = [{ id: 1, name: 'Farm1', lat: 36.5, lng: 8.8 }];
  render(<MapView farms={farms} />);

  expect(screen.getByTestId('map-container')).toBeInTheDocument();
});
