import { render, screen } from '@testing-library/react';
import App from './App';

test(`renders today's date`, () => {
  render(<App />);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const todaysDate = new Date().toLocaleDateString("en-US", options);
  const linkElement = screen.getByText(todaysDate);
  expect(linkElement).toBeInTheDocument();
});
