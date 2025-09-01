// src/tests/WeatherWidget.test.jsx
import { render, screen } from '@testing-library/react'
import WeatherWidget from '../components/weather/WeatherWidget' // <-- ajuste
import axios from 'axios'
import { vi } from 'vitest'

vi.mock('axios')

test('shows 7-day forecast title', async () => {
  // mock réponse simplified
  axios.get.mockResolvedValueOnce({
    data: { daily: new Array(7).fill(0).map((_,i) => ({ dt: i, temp: { day: 20 + i } })) }
  })

  render(<WeatherWidget lat={36.5} lon={8.7} />) // passe props si ton widget les attend

  expect(await screen.findByText(/7-day forecast/i)).toBeInTheDocument()
})
