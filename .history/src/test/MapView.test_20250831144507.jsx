// FarmMap.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import FarmMap from "../components/FarmMap";
import axios from "axios";
import { describe, expect, beforeEach, it,  jest} from "vitest";



// Mock axios
jest.mock("axios");

// Fake farms data
const farms = [
  { farmer_id: 1, farmerName: "Ali", lat: 36.5, lng: 8.8, locationUrl: "https://maps.google.com" },
  { farmer_id: 2, farmerName: "Sara", lat: 36.6, lng: 8.9 },
];

// Fake crops
const crops = [
  { crop_id: 101, crop_name: "Tomato", crop_type: "Vegetable", quantity: 50, price: 3.5, availability: true },
  { crop_id: 102, crop_name: "Potato", crop_type: "Vegetable", quantity: 80, price: 2.0, availability: false },
];

describe("FarmMap component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the map container", () => {
    render(<FarmMap farms={farms} />);
    expect(screen.getByRole("button")).toBeInTheDocument(); // leaflet tilelayer accessible button
  });

  it("renders markers for farms", async () => {
    render(<FarmMap farms={farms} />);
    // farmer names are inside popups, so we wait for async fetch
    expect(await screen.findByText("Ali")).toBeInTheDocument();
    expect(await screen.findByText("Sara")).toBeInTheDocument();
  });

  it("shows loading then crops when axios resolves", async () => {
    axios.get.mockResolvedValueOnce({ data: crops });

    render(<FarmMap farms={[farms[0]]} />);

    // Loading indicator
    expect(await screen.findByText(/Loading crops/i)).toBeInTheDocument();

    // Then crops
    await waitFor(() => {
      expect(screen.getByText(/Tomato/)).toBeInTheDocument();
      expect(screen.getByText(/Potato/)).toBeInTheDocument();
    });
  });

  it("shows 'No crops available' when API returns empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<FarmMap farms={[farms[0]]} />);

    await waitFor(() => {
      expect(screen.getByText(/No crops available/i)).toBeInTheDocument();
    });
  });

  it("shows error fallback when axios fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    render(<FarmMap farms={[farms[0]]} />);

    await waitFor(() => {
      expect(screen.getByText(/No crops available/i)).toBeInTheDocument();
    });
  });
});
