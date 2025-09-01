// src/tests/CropsList.test.jsx
import { render, screen } from '@testing-library/react'
import CropsList from "../pages//farmer//CropForm"
import axios from 'axios'
import { test, expect, vi } from 'vitest'

vi.mock('axios')

test('renders crop rows', async () => {
  const mockCrops = [
    { crop_id: 1, crop_name: 'Tomate', price: 3.5 },
    { crop_id: 2, crop_name: 'Carotte', price: 2.5 }
  ]
  axios.get.mockResolvedValueOnce({ data: mockCrops })

  render(<CropsList />)

  // findByText attend async
  expect(await screen.findByText(/Tomate/i)).toBeInTheDocument()
  expect(await screen.findByText(/Carotte/i)).toBeInTheDocument()
})
