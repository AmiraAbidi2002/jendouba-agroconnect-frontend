import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CropForm from '../pages/farmer/CropForm';
import {describe, test, expect} from "vitest"

describe('Crop Form Tests', () => {
  test('renders crop form fields', () => {
    render(<CropForm />);
    expect(screen.getByLabelText(/Crop Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Harvest Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
  });

  test('can submit crop form', () => {
    const mockSubmit = jest.fn();
    render(<CropForm onSubmit={mockSubmit} />);

    userEvent.type(screen.getByLabelText(/Crop Name/i), 'Tomato');
    userEvent.type(screen.getByLabelText(/Quantity/i), '50');
    userEvent.type(screen.getByLabelText(/Harvest Date/i), '2025-09-30');
    userEvent.type(screen.getByLabelText(/Price/i), '100');
    userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
