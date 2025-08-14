import { render, screen } from '@testing-library/react'
import Page from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Page />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Zeropoint Protocol/i)
  })

  it('renders navigation links', () => {
    render(<Page />)
    
    // Check for main navigation links
    expect(screen.getByText(/Documentation/i)).toBeInTheDocument()
    expect(screen.getByText(/Developer Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Legal/i)).toBeInTheDocument()
  })

  it('renders platform description', () => {
    render(<Page />)
    expect(screen.getByText(/Dual Consensus Agentic AI Platform/i)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<Page />)
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
    expect(screen.getByText(/View Documentation/i)).toBeInTheDocument()
  })
})
