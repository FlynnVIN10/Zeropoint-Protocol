import { render, screen } from '@testing-library/react'
import WhitelabelPage from '../page'

describe('Whitelabel Page', () => {
  it('renders the main heading', () => {
    render(<WhitelabelPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Whitelabel Program/i)
  })

  it('renders program overview section', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Program Overview/i)).toBeInTheDocument()
    expect(screen.getByText(/Target Partners/i)).toBeInTheDocument()
    expect(screen.getByText(/Program Benefits/i)).toBeInTheDocument()
  })

  it('renders rebranding section', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Rebranding & Customization/i)).toBeInTheDocument()
    expect(screen.getByText(/UI\/UX Customization/i)).toBeInTheDocument()
    expect(screen.getByText(/Technical Customization/i)).toBeInTheDocument()
  })

  it('renders resale section', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Resale & Distribution/i)).toBeInTheDocument()
    expect(screen.getByText(/Pricing Models/i)).toBeInTheDocument()
    expect(screen.getByText(/Distribution Channels/i)).toBeInTheDocument()
  })

  it('renders partner obligations', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Partner Obligations/i)).toBeInTheDocument()
    expect(screen.getByText(/Quality Standards/i)).toBeInTheDocument()
    expect(screen.getByText(/Reporting Requirements/i)).toBeInTheDocument()
  })

  it('renders support section', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Support & Training/i)).toBeInTheDocument()
    const supportSection = screen.getByRole('heading', { name: /Support & Training/i }).closest('section')
    expect(supportSection).toHaveTextContent(/Technical Support/i)
    expect(supportSection).toHaveTextContent(/Training Programs/i)
  })

  it('renders application process', () => {
    render(<WhitelabelPage />)
    expect(screen.getByText(/Application Process/i)).toBeInTheDocument()
    expect(screen.getByText(/Apply for Partnership/i)).toBeInTheDocument()
  })

  it('renders back to legal link', () => {
    render(<WhitelabelPage />)
    const backLink = screen.getByText(/← Back to Legal Information/i)
    expect(backLink).toBeInTheDocument()
    expect(backLink.closest('a')).toHaveAttribute('href', '/legal')
  })
})
