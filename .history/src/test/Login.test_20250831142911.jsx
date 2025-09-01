// src/tests/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from "../pages/AuthPage" 
import axios from 'axios'
import { test, expect, vi } from 'vitest'

vi.mock('axios')

test('login calls backend and stores token', async () => {
  // mock réponse backend
  axios.post.mockResolvedValueOnce({ data: { token: 'fake-jwt-token' } })

  render(<Login />)

  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'amira@test.com' } })
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))

  // attendre que le composant ait traité la promesse
  await waitFor(() => {
    expect(localStorage.getItem('token')).toBe('fake-jwt-token')
  })

  expect(axios.post).toHaveBeenCalled()
})
