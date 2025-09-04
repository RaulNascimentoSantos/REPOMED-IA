import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthRegisterPage } from '../../src/pages/AuthRegisterPage';

describe('AuthRegisterPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AuthRegisterPage />
      </BrowserRouter>
    );
  });

  test('renders the registration form', () => {
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CRM/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument();
  });

  test('shows validation errors for invalid data', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/O nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/CRM inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/A senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  test('submits the form with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token' }),
      })
    );

    fireEvent.input(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Test User' } });
    fireEvent.input(screen.getByLabelText(/E-mail/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/CRM/i), { target: { value: '123456' } });
    fireEvent.input(screen.getByLabelText(/Senha/i), { target: { value: 'password123' } });
    fireEvent.input(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
