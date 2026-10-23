import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./Admin', () => () => <div>Admin</div>);
jest.mock('./DriverSuccess', () => () => <div>Driver</div>);
jest.mock('./ParentSuccess', () => () => <div>Parent</div>);

test('renders G5BUS login screen', () => {
  render(<App />);
  expect(screen.getByText('G5BUS')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});
