// src/tests/MapView.test.jsx
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import MapView from "../components//FarmMap"

test('renders map container', () => {
  // Si MapView utilise Leaflet et plante en test, assure-toi d'avoir un <div data-testid="map-container"> dans le composant
  render(<MapView />)
  expect(screen.getByTestId('map-container')).toBeInTheDocument()
})
