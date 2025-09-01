// src/test/WeatherWidget.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import WeatherWidget from '../components/WeatherWidget'

// Mock global fetch
const mockFetch = vi.fn()

beforeAll(() => {
  globalThis.fetch = mockFetch
})

afterEach(() => {
  mockFetch.mockReset()
})

afterAll(() => {
  delete globalThis.fetch
})

test('WeatherWidget affiche la météo correctement', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      temperature: 25,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 15,
    }),
  })

  render(<WeatherWidget />)
  
  expect(await screen.findByText(/25/i)).toBeInTheDocument()
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument()
})

test('WeatherWidget affiche une erreur en cas de problème API', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
  })

  render(<WeatherWidget />)
  
  expect(await screen.findByText(/erreur/i)).toBeInTheDocument()
})
