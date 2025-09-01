import { render, screen, fireEvent } from "@testing-library/react";
import MessageList from "../components/MessageList";
import axios from "axios";
import { vi, test, expect } from "vitest";

vi.mock("axios");

test("affiche 'No conversations' si vide", async () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<MessageList user={{ id: 1 }} />);
  expect(await screen.findByText("No conversations")).toBeInTheDocument();
});

test("affiche la liste des conversations", async () => {
  axios.get.mockResolvedValue({ data: [{ user_name: "Bob" }] });
  render(<MessageList user={{ id: 1 }} />);
  expect(await screen.findByText("Bob")).toBeInTheDocument();
});

test("permet la recherche", async () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<MessageList user={{ id: 1 }} />);
  
  fireEvent.change(screen.getByPlaceholderText(/search/i), {
    target: { value: "test" }
  });
  
  expect(screen.getByDisplayValue("test")).toBeInTheDocument();
});