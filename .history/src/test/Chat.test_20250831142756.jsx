// src/tests/Chat.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Chat from "../components//MessageList"
import axios from 'axios'
import { test, expect, vi } from 'vitest'

vi.mock('axios')

test('send message adds bubble to list', async () => {
  // si Chat poste via axios.post, mock la réponse
  axios.post.mockResolvedValueOnce({ data: { id: 1, content: 'Bonjour', senderId: 1 } })

  render(<Chat />)

  fireEvent.change(screen.getByPlaceholderText(/message/i), { target: { value: 'Bonjour' } })
  fireEvent.click(screen.getByRole('button', { name: /send/i }))

  expect(await screen.findByText('Bonjour')).toBeInTheDocument()
})
