// src/test/WeatherWidget.test.jsx
import { test, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import WeatherWidget from '../components/WeatherWidget'

// Mock global de fetch
const mockFetch = vi.fn()

beforeAll(() => {
  global.fetch = mockFetch
})

afterEach(() => {
  mockFetch.mockReset()
})

afterAll(() => {
  delete global.fetch
})

test('WeatherWidget affiche la météo correctement', async () => {
  // Mock de la réponse API
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      temperature: 25,
      condition: 'Sunny',
      humidity: 60,
      windSpeed: 15
    })
  })

  render(<WeatherWidget />)
  
  // Vérifier que les données sont affichées
  expect(await screen.findByText(/25/i)).toBeInTheDocument()
  expect(await screen.findByText(/Sunny/i)).toBeInTheDocument()
})

test('WeatherWidget affiche une erreur en cas de problème API', async () => {
  // Mock d'une erreur API
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500
  })

  render(<WeatherWidget />)
  
  // Vérifier qu'un message d'erreur est affiché
  expect(await screen.findByText(/erreur/i)).toBeInTheDocument()
})