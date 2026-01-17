import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the app title and auth links when logged out', () => {
  render(<App />)

  expect(screen.getByText('MINDS Activity Signup')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
})
