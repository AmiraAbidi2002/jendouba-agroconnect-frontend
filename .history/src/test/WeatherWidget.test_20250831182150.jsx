// src/test/WeatherWidget.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect, vi, beforeAll, afterAll } from 'vitest'
import WeatherWidget from '../components/WeatherWidget'

// Mock global fetch
const mockFetch = vi.fn()

beforeAll(() => {
  globalThis.fetch = mockFetch
})



afterAll(() => {
  delete globalThis.fetch
})

test('WeatherWidget affiche la météo correctement', async () => {globalThis.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ temperature: 25, condition: "Sunny" }),
  })

  render(<WeatherWidget />)
  
  expect(await screen.findByText(/25/i)).toBeInTheDocument()
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument()
})

test('WeatherWidget affiche une erreur en cas de problème API', async () => {
 globalThis.fetch.mockResolvedValueOnce({ ok: false })

  render(<WeatherWidget />)
  
  expect(await screen.findByText(/erreur/i)).toBeInTheDocument()
})
