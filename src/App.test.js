import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the resume generator', () => {
  render(<App />);
  expect(screen.getAllByText(/curriculo limpo/i).length).toBeGreaterThan(0);
});
