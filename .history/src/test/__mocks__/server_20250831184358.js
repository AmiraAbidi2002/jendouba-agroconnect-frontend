// src/test/__mocks__/server.js
import { setupServer } from "msw/node";
import { rest } from "msw";

// Définir tous les handlers ici
export const handlers = [
  // GET /api/crops
  rest.get("/api/crops", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { crop_id: 1, crop_name: "Wheat" },
        { crop_id: 2, crop_name: "Corn" },
      ])
    );
  }),

  // POST /api/auth/login
  rest.post("/api/auth/login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: "fake-token", user: { name: "Test User" } })
    );
  }),

  // GET /api/weather
  rest.get("/api/weather", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ temperature: 25, condition: "Sunny" })
    );
  }),
];

// Créer le serveur MSW avec ces handlers
export const server = setupServer(...handlers);
