import { render, screen } from '@testing-library/react'
import LibraryPage from '../page'

describe('Library Page', () => {
  it('renders the main heading', () => {
    render(<LibraryPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Developer Library/i)
  })

  it('renders SDKs & Libraries section', () => {
    render(<LibraryPage />)
    const sdksHeading = screen.getByRole('heading', { name: /SDKs & Libraries/i })
    expect(sdksHeading).toBeInTheDocument()
    
    // Check that the section contains the expected content
    const sdksSection = sdksHeading.closest('section')
    expect(sdksSection).toBeInTheDocument()
    expect(sdksSection).toHaveTextContent(/Python SDK/i)
    expect(sdksSection).toHaveTextContent(/JavaScript SDK/i)
    expect(sdksSection).toHaveTextContent(/Go SDK/i)
  })

  it('renders UE5 Integration section', () => {
    render(<LibraryPage />)
    const ue5Heading = screen.getByRole('heading', { name: /UE5 Integration/i, level: 2 })
    expect(ue5Heading).toBeInTheDocument()
    expect(screen.getByText(/UE5 Plugins/i)).toBeInTheDocument()
    
    // Check that the section contains the expected content
    const ue5Section = ue5Heading.closest('section')
    expect(ue5Section).toBeInTheDocument()
    expect(ue5Section).toHaveTextContent(/Integration Tools/i)
  })

  it('renders CLI Tools section', () => {
    render(<LibraryPage />)
    const cliHeading = screen.getByRole('heading', { name: /CLI Tools/i })
    expect(cliHeading).toBeInTheDocument()
    
    // Check that the section contains the expected content
    const cliSection = cliHeading.closest('section')
    expect(cliSection).toBeInTheDocument()
    expect(cliSection).toHaveTextContent(/Platform Management/i)
    expect(cliSection).toHaveTextContent(/Development Tools/i)
  })

  it('renders Code Examples section', () => {
    render(<LibraryPage />)
    const examplesHeading = screen.getByRole('heading', { name: /Code Examples/i })
    expect(examplesHeading).toBeInTheDocument()
    expect(screen.getByText(/Basic Examples/i)).toBeInTheDocument()
    expect(screen.getByText(/Advanced Examples/i)).toBeInTheDocument()
  })

  it('renders API Reference section', () => {
    render(<LibraryPage />)
    const apiHeading = screen.getByRole('heading', { name: /API Reference/i })
    expect(apiHeading).toBeInTheDocument()
    expect(screen.getByText(/Core Services/i)).toBeInTheDocument()
    expect(screen.getByText(/Integration APIs/i)).toBeInTheDocument()
  })

  it('renders Getting Started section', () => {
    render(<LibraryPage />)
    const gettingStartedHeading = screen.getByRole('heading', { name: /Getting Started/i })
    expect(gettingStartedHeading).toBeInTheDocument()
    expect(screen.getByText(/Python Development/i)).toBeInTheDocument()
    expect(screen.getByText(/Web Applications/i)).toBeInTheDocument()
    
    // Check that the section contains the expected content
    const gettingStartedSection = gettingStartedHeading.closest('section')
    expect(gettingStartedSection).toBeInTheDocument()
    expect(gettingStartedSection).toHaveTextContent(/UE5 Integration/i)
  })
})
