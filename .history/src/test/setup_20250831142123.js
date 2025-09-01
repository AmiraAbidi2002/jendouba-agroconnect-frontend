// src/test/setup.ts
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
afterEach(() => {
  // reset global mocks
  // vi.restoreAllMocks() // si besoin, utilise vi.restoreAllMocks() dans tests
})