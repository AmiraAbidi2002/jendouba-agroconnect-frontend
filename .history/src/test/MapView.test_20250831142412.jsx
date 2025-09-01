// src/tests/MapView.test.jsx
import { render, screen } from '@testing-library/react'
import MapView from '../components/map/MapView' // <-- ajuste

test('renders map container', () => {
  // Si MapView utilise Leaflet et plante en test, assure-toi d'avoir un <div data-testid="map-container"> dans le composant
  render(<MapView />)
  expect(screen.getByTestId('map-container')).toBeInTheDocument()
})
