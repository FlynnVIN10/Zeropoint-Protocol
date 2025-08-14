import { render, screen } from '@testing-library/react'
import DocsPage from '../page'

describe('Documentation Page', () => {
  it('renders the main heading', () => {
    render(<DocsPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Documentation v1/i)
  })

  it('renders quick start section', () => {
    render(<DocsPage />)
    expect(screen.getByText(/Quick Start/i)).toBeInTheDocument()
    expect(screen.getByText(/Platform Setup/i)).toBeInTheDocument()
    expect(screen.getByText(/First AI Agent/i)).toBeInTheDocument()
    expect(screen.getByText(/API Integration/i)).toBeInTheDocument()
  })

  it('renders API reference section', () => {
    render(<DocsPage />)
    expect(screen.getByText(/API Reference/i)).toBeInTheDocument()
    expect(screen.getByText(/Core APIs/i)).toBeInTheDocument()
    expect(screen.getByText(/Authentication/i)).toBeInTheDocument()
  })

  it('renders Petals integration section', () => {
    render(<DocsPage />)
    expect(screen.getByText(/Petals Integration/i)).toBeInTheDocument()
    expect(screen.getByText(/Setup & Configuration/i)).toBeInTheDocument()
    expect(screen.getByText(/Usage & Operations/i)).toBeInTheDocument()
  })

  it('renders UE5 & Wondercraft section', () => {
    render(<DocsPage />)
    expect(screen.getByText(/UE5 & Wondercraft/i)).toBeInTheDocument()
    expect(screen.getByText(/UE5 Setup/i)).toBeInTheDocument()
    expect(screen.getByText(/Wondercraft Features/i)).toBeInTheDocument()
  })

  it('renders governance section', () => {
    render(<DocsPage />)
    expect(screen.getByText(/Governance & Consensus/i)).toBeInTheDocument()
    expect(screen.getByText(/Consensus Mechanisms/i)).toBeInTheDocument()
    expect(screen.getByText(/Governance Framework/i)).toBeInTheDocument()
  })
})
