// src/setupTests.js
import "@testing-library/jest-dom"; // 🔹 matchers supplémentaires (toBeInTheDocument, etc.)
import { server } from "./__mocks__/server"; // si tu utilises MSW (Mock Service Worker)
import { beforeAll, beforeEach, afterAll, afterEach, jest } from "vitest";
// ✅ Mock localStorage
beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
});

// ✅ Mock window.location (évite les vrais redirections pendant les tests)
const mockLocation = new URL("http://localhost/");
delete window.location;
window.location = {
  ...mockLocation,
  assign: jest.fn(),
  reload: jest.fn(),
};

// ✅ Nettoyage des mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ Si tu utilises MSW (facultatif)
if (server) {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

// ✅ Supprime les erreurs console inutiles (ex. warnings React, act())
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});
