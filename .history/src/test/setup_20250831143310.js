// src/test/setup.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// mock window.localStorage (simple)
const localStorageMock = (() => {
  let store = {}
  return {
    getItem(key) { return store[key] ?? null },
    setItem(key, value) { store[key] = String(value) },
    removeItem(key) { delete store[key] },
    clear() { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: false
})

// polyfill matchMedia used by some libs
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
  }
}

// optional: silence console.error during tests (uncomment if noisy)
// const originalError = console.error
// beforeEach(() => { console.error = (...args) => {} })
// afterEach(() => { console.error = originalError })
