// src/test/__mocks__/server.js
import { setupServer } from "msw/node";
import { rest } from "msw";

export const server = setupServer(
  rest.get("http://localhost:8080/weather", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        temperature: 25,
        condition: "Sunny",
        forecast: [
          { day: "Mon", temperature: 25, condition: "Sunny" },
          { day: "Tue", temperature: 26, condition: "Cloudy" },
        ],
      })
    );
  }),
  rest.get("/api/crops", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { crop_id: 1, crop_name: "Wheat" },
        { crop_id: 2, crop_name: "Corn" },
      ])
    );
  }),
  rest.post("/api/auth/login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: "fake-token", user: { name: "Test User" } })
    );
  })
);
