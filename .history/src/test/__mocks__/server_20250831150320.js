// src/test/__mocks__/server.js
import { setupServer } from "msw/node";
import { rest } from "msw";

// Ici, tu peux mocker toutes tes routes API utilisées dans tes tests
const handlers = [
  rest.get("/api/crops", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { crop_id: 1, crop_name: "Wheat" },
        { crop_id: 2, crop_name: "Corn" },
      ])
    );
  }),
  // ajoute d’autres handlers si nécessaire
];

export const server = setupServer(...handlers);
