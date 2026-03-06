import { render, screen } from '@testing-library/react';
import App from './App';

test(`renders today's date`, () => {
  render(<App />);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const todaysDate = new Date().toLocaleDateString("en-US", options);
  const linkElement = screen.getByText(todaysDate);
  expect(linkElement).toBeInTheDocument();
});

test('renders the SVG chart with an accessible role and label', () => {
  render(<App />);
  const svg = screen.getByRole('img');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Wheel of the Year'));
});

test('renders a screen-reader live region for hover announcements', () => {
  render(<App />);
  const liveRegion = document.querySelector('[aria-live="polite"]');
  expect(liveRegion).toBeInTheDocument();
  expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  // Initially empty – no date is hovered
  expect(liveRegion.textContent).toBe('');
});
