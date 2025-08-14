import { render, screen } from '@testing-library/react'
import LegalPage from '../page'

describe('Legal Page', () => {
  it('renders the main heading', () => {
    render(<LegalPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Legal Information/i)
  })

  it('renders quick navigation section', () => {
    render(<LegalPage />)
    const quickNavHeading = screen.getByRole('heading', { name: /Quick Navigation/i })
    expect(quickNavHeading).toBeInTheDocument()
    expect(screen.getByText(/Whitelabel Program/i)).toBeInTheDocument()
  })

  it('renders license information', () => {
    render(<LegalPage />)
    const openSourceHeading = screen.getByRole('heading', { name: /Open Source Licenses/i })
    expect(openSourceHeading).toBeInTheDocument()
    const proprietaryHeading = screen.getByRole('heading', { name: /Proprietary License/i })
    expect(proprietaryHeading).toBeInTheDocument()
  })

  it('renders terms of service', () => {
    render(<LegalPage />)
    const tosHeading = screen.getByRole('heading', { name: /Terms of Service/i })
    expect(tosHeading).toBeInTheDocument()
  })

  it('renders privacy policy', () => {
    render(<LegalPage />)
    const privacyHeading = screen.getByRole('heading', { name: /Privacy Policy/i })
    expect(privacyHeading).toBeInTheDocument()
  })

  it('renders contact information', () => {
    render(<LegalPage />)
    const contactHeading = screen.getByRole('heading', { name: /Contact Information/i })
    expect(contactHeading).toBeInTheDocument()
    expect(screen.getByText(/legal@zeropointprotocol.ai/i)).toBeInTheDocument()
  })
})
