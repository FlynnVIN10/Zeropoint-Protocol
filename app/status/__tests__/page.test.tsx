import { render, screen } from '@testing-library/react'
import StatusPage from '../page'

describe('Status Page', () => {
  it('renders the main heading', () => {
    render(<StatusPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/System Status/i)
  })

  it('renders platform health section', () => {
    render(<StatusPage />)
    const healthHeading = screen.getByRole('heading', { name: /Platform Health/i })
    expect(healthHeading).toBeInTheDocument()
    
    // Find the platform health section and check for the status cards within it
    const healthSection = healthHeading.closest('section')
    expect(healthSection).toBeInTheDocument()
    
    // Check that the section contains the expected status cards
    expect(healthSection).toHaveTextContent(/Core Platform/i)
    expect(healthSection).toHaveTextContent(/AI Agents/i)
    expect(healthSection).toHaveTextContent(/Consensus Engine/i)
    expect(healthSection).toHaveTextContent(/Storage System/i)
  })

  it('renders performance metrics section', () => {
    render(<StatusPage />)
    const performanceHeading = screen.getByRole('heading', { name: /Performance Metrics/i })
    expect(performanceHeading).toBeInTheDocument()
    expect(screen.getByText(/System Performance/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Agent Metrics/i)).toBeInTheDocument()
  })

  it('renders recent updates section', () => {
    render(<StatusPage />)
    const updatesHeading = screen.getByRole('heading', { name: /Recent Updates/i })
    expect(updatesHeading).toBeInTheDocument()
    expect(screen.getByText(/Platform Update v1.2.3/i)).toBeInTheDocument()
    expect(screen.getByText(/UE5 Integration Release/i)).toBeInTheDocument()
    expect(screen.getByText(/Petals Framework Update/i)).toBeInTheDocument()
  })

  it('renders service status section', () => {
    render(<StatusPage />)
    const serviceHeading = screen.getByRole('heading', { name: /Service Status/i })
    expect(serviceHeading).toBeInTheDocument()
    expect(screen.getByText(/Core Services/i)).toBeInTheDocument()
    expect(screen.getByText(/Integration Services/i)).toBeInTheDocument()
  })

  it('renders incident history section', () => {
    render(<StatusPage />)
    const incidentHeading = screen.getByRole('heading', { name: /Incident History/i })
    expect(incidentHeading).toBeInTheDocument()
    expect(screen.getByText(/Minor Performance Degradation/i)).toBeInTheDocument()
    expect(screen.getByText(/Scheduled Maintenance/i)).toBeInTheDocument()
  })

  it('renders system information section', () => {
    render(<StatusPage />)
    const systemHeading = screen.getByRole('heading', { name: /System Information/i })
    expect(systemHeading).toBeInTheDocument()
    expect(screen.getByText(/Platform Details/i)).toBeInTheDocument()
    expect(screen.getByText(/Infrastructure/i)).toBeInTheDocument()
  })

  it('renders contact and support section', () => {
    render(<StatusPage />)
    const contactHeading = screen.getByRole('heading', { name: /Contact & Support/i })
    expect(contactHeading).toBeInTheDocument()
    expect(screen.getByText(/support@zeropointprotocol.ai/i)).toBeInTheDocument()
    expect(screen.getByText(/emergency@zeropointprotocol.ai/i)).toBeInTheDocument()
  })

  it('displays operational status indicators', () => {
    render(<StatusPage />)
    const operationalStatuses = screen.getAllByText(/Operational/i)
    expect(operationalStatuses.length).toBeGreaterThan(0)
  })

  it('displays performance metrics', () => {
    render(<StatusPage />)
    expect(screen.getByText(/23%/i)).toBeInTheDocument()
    expect(screen.getByText(/67%/i)).toBeInTheDocument()
    expect(screen.getByText(/45%/i)).toBeInTheDocument()
  })
})
