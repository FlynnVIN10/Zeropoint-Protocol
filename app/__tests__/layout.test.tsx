import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

describe('Root Layout', () => {
  it('renders the navigation header', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    expect(screen.getByText(/Zeropoint Protocol/i)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    // Check main navigation links
    expect(screen.getByText(/Documentation/i)).toBeInTheDocument()
    expect(screen.getByText(/Developer Library/i)).toBeInTheDocument()
    expect(screen.getByText(/Status/i)).toBeInTheDocument()
    expect(screen.getByText(/Legal/i)).toBeInTheDocument()
  })

  it('renders external links', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument()
    expect(screen.getByText(/Contact/i)).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('has correct navigation structure', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('renders contact button with correct styling', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    const contactButton = screen.getByText(/Contact/i)
    expect(contactButton).toHaveClass('bg-blue-600')
  })

  it('renders GitHub link with correct attributes', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )
    
    const githubLink = screen.getByText(/GitHub/i)
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank')
    expect(githubLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
