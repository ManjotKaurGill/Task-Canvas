import { render, screen } from '@testing-library/react';
import App from './App';

// ✅ Mock firebase auth object
jest.mock('./firebase/firebaseConfig', () => ({
  auth: {
    currentUser: null // mock user if needed
  }
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));

test('renders Home component with main headline', () => {
  render(<App />);
  expect(screen.getByText(/TaskCanvas/i)).toBeInTheDocument();
});

test('renders Get Started button on Home screen', () => {
  render(<App />);
  expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
});

test('renders Why TaskCanvas section', () => {
  render(<App />);
  expect(screen.getByText(/Why TaskCanvas/i)).toBeInTheDocument();
});

test('renders footer copyright', () => {
  render(<App />);
  expect(screen.getByText(/© 2025 TaskCanvas/i)).toBeInTheDocument();
});
