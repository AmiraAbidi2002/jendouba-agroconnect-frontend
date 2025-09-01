import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../components/MessageList';
import { test,jest, expect } from 'vitest';

test('renders chat input and sends message', () => {
  const mockSendMessage = jest.fn();
  render(<Chat sendMessage={mockSendMessage} messages={[]} />);

  const input = screen.getByPlaceholderText(/Type a message/i);
  const sendButton = screen.getByRole('button', { name: /Send/i });

  userEvent.type(input, 'Hello Farmer');
  userEvent.click(sendButton);

  expect(mockSendMessage).toHaveBeenCalledWith('Hello Farmer');
});
