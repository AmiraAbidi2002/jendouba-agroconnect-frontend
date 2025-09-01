// chat.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import MessageList from "../components/MessageList";
import { describe, expect, beforeEach, test, jest} from "vitest";
// === Mock axios ===
jest.mock("axios");

const mockUser = { id: 1, user_name: "Alice" };

describe("MessageList component", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-jwt-token");
    jest.clearAllMocks();
  });

  test("renders conversation sidebar", () => {
    render(<MessageList user={mockUser} />);
    expect(screen.getByText("Conversations")).toBeInTheDocument();
  });

  test("shows 'No conversations' if none exist", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<MessageList user={mockUser} />);
    expect(await screen.findByText("No conversations")).toBeInTheDocument();
  });

  test("renders a list of conversations", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 2, user_name: "Bob", lastMessage: "Hello!" },
        { id: 3, user_name: "Charlie", lastMessage: "Yo!" },
      ],
    });

    render(<MessageList user={mockUser} />);

    expect(await screen.findByText("Bob")).toBeInTheDocument();
    expect(await screen.findByText("Charlie")).toBeInTheDocument();
  });

  test("allows searching for users", async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // conversations
    axios.get.mockResolvedValueOnce({
      data: [{ user_id: 4, user_name: "David" }],
    });

    render(<MessageList user={mockUser} />);

    fireEvent.change(screen.getByPlaceholderText(/Search by ID or Name/), {
      target: { value: "David" },
    });

    fireEvent.click(screen.getByRole("button", { name: "" })); // search button

    expect(await screen.findByText("David")).toBeInTheDocument();
  });

  test("displays conversation messages", async () => {
    // First call: conversations
    axios.get.mockResolvedValueOnce({
      data: [{ id: 2, user_name: "Bob", lastMessage: "Hello!" }],
    });
    // Second call: messages
    axios.get.mockResolvedValueOnce({
      data: [
        { msg_id: 1, senderId: 1, content: "Hi Bob!", timestamp: new Date().toISOString() },
        { msg_id: 2, senderId: 2, content: "Hey Alice!", timestamp: new Date().toISOString() },
      ],
    });

    render(<MessageList user={mockUser} />);

    const bob = await screen.findByText("Bob");
    fireEvent.click(bob);

    expect(await screen.findByText("Hi Bob!")).toBeInTheDocument();
    expect(await screen.findByText("Hey Alice!")).toBeInTheDocument();
  });

  test("sends a new message", async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 2, user_name: "Bob", lastMessage: "Hello!" }] });
    axios.get.mockResolvedValueOnce({ data: [] }); // messages
    axios.post.mockResolvedValueOnce({}); // send msg
    axios.get.mockResolvedValueOnce({
      data: [{ msg_id: 1, senderId: 1, content: "New message!", timestamp: new Date().toISOString() }],
    });

    render(<MessageList user={mockUser} />);

    const bob = await screen.findByText("Bob");
    fireEvent.click(bob);

    fireEvent.change(screen.getByPlaceholderText("Type a message..."), {
      target: { value: "New message!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "" })); // send button

    expect(await screen.findByText("New message!")).toBeInTheDocument();
  });
});
