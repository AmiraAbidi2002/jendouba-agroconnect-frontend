// FarmMap.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import FarmMap from "../components/FarmMap";
import { describe, test,expect } from "vitest";
describe("FarmMap component", () => {
  test("renders 'No crops available' when crops list is empty", () => {
    render(<FarmMap crops={[]} />);
    
    // Utilisation d'un matcher flexible pour éviter les problèmes de texte imbriqué
    const noCropsText = screen.getByText((content, node) => {
      return node.textContent === "No crops available";
    });
    
    expect(noCropsText).toBeInTheDocument();
  });

  test("renders crop markers when crops exist", () => {
    const crops = [
      { id: 1, name: "Wheat", latitude: 36.8, longitude: 10.2 },
      { id: 2, name: "Corn", latitude: 36.9, longitude: 10.3 },
    ];

    render(<FarmMap crops={crops} />);
    
    // On vérifie la présence des noms de cultures
    expect(screen.getByText("Wheat")).toBeInTheDocument();
    expect(screen.getByText("Corn")).toBeInTheDocument();
  });
});
