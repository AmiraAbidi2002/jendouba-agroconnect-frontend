import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/AuthPage';
import Register from '../pages/AuthPage';

import {describe, test, expect} from "vitest"

describe('Authentication Tests', () => {

  test('Login form renders correctly', () => {
    render(<Login />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('Register form submits correctly', async () => {
    render(<Register />);
    userEvent.type(screen.getByLabelText(/Name/i), 'Amira');
    userEvent.type(screen.getByLabelText(/Email/i), 'amira@example.com');
    userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Vérifie qu’un message de succès apparaît ou qu’on redirige
    expect(await screen.findByText(/Registration successful/i)).toBeInTheDocument();
  });

});
