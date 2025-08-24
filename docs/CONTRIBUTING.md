# Contributing to Zeropoint Protocol

## Development Principles
- **TDD First**: Write tests before implementation
- **Security Focus**: Security built into every layer
- **Evidence Based**: Support claims with data and testing
- **Transparency**: Public evidence and accountability

## Code Quality Standards
- Follow language-specific best practices
- Include comprehensive error handling
- Write clear, documented code
- Ensure all functions are testable

## Testing Requirements
- Unit tests for all new functions
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Evidence collection and verification

## Workflow
1. Create feature branch from main
2. Implement with tests
3. Update documentation
4. Submit pull request
5. Address review feedback
6. Merge after approval

## Review Requirements
- Minimum 2 reviews (Dev + SCRA)
- All tests must pass
- Evidence must be collected
- Security review completed

## Repository Structure
- `public/` - Static assets and pages
- `functions/` - Cloudflare Functions
- `evidence/` - Training metrics and compliance
- `docs/` - Project documentation
- `scripts/` - Build and utility scripts

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up development environment
4. Run tests: `npm test`
5. Start development server: `wrangler pages dev`
