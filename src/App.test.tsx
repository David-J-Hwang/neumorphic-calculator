import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the calculator shell', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Neumorphic Calculator' })).toBeInTheDocument();
    expect(screen.getByText('Basic mode')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Calculator display' })).toHaveTextContent('0');
  });

  it('calculates a basic expression through button clicks', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    const display = screen.getByRole('region', { name: 'Calculator display' });

    expect(within(display).getByText('3')).toBeInTheDocument();
  });
});
