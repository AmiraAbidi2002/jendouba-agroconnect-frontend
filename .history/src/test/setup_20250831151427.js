// src/setupTests.js
import "@testing-library/jest-dom/vitest"; // 🔹 Utilisez la version vitest
import { vi, beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import { server } from "./test/__mocks__/server"; 

// ✅ Mock localStorage
beforeAll(() => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
});

// ✅ Mock window.location (évite les vrais redirections pendant les tests)
const mockLocation = new URL("http://localhost/");
delete window.location;
window.location = {
  ...mockLocation,
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
  href: "http://localhost/",
};

// ✅ Nettoyage des mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ✅ Si tu utilises MSW
if (server) {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
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

afterAll(() => {
  console.error = originalError;
});