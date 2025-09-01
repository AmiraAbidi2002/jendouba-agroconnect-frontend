// src/test/__mocks__/server.js
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";


// Ici, tu peux mocker toutes tes routes API utilisées dans tes tests
const handlers = [
  http.get("/api/crops", () => {
    return HttpResponse.json([
      { crop_id: 1, crop_name: "Wheat" },
      { crop_id: 2, crop_name: "Corn" },
    ], { status: 200 });
  }),
  // ajoute d'autres handlers si nécessaire
  http.post("/api/auth/login", () => {
    return HttpResponse.json(
      { token: "fake-token", user: { name: "Test User" } },
      { status: 200 }
    );
  }),
  http.get("/api/weather", () => {
    return HttpResponse.json(
      { temperature: 25, condition: "Sunny" },
      { status: 200 }
    );
  }),
];

export const server = setupServer(...handlers);
