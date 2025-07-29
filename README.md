# Zeropoint Protocol Corporate Website

This is the corporate website for Zeropoint Protocol, built with Docusaurus.

## Deployment

This website is deployed on **Cloudflare Pages** at https://zeropointprotocol.ai

### Deployment Configuration
- **Platform**: Cloudflare Pages
- **Framework**: Docusaurus
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `build`
- **Environment**: Production

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## Status Synchronization

The website automatically syncs deployment status from the main project repository via the `scripts/sync-status.js` script, which runs before each build.

## Pages

- **Home**: Overview and mission statement
- **Technology**: AI features and capabilities
- **Use Cases**: Value propositions and applications
- **Status**: Current system status and deployment progress
- **Legal**: Company information and licensing
- **Contact**: Contact information and support

## Build Process

The website automatically:
1. Syncs status from the main project's `DEPLOYMENT_STATUS.md`
2. Builds the static site with Docusaurus
3. Deploys to Cloudflare Pages

## Custom Domain

The website is accessible at:
- **Primary**: https://zeropointprotocol.ai
- **www**: https://www.zeropointprotocol.ai

SSL/TLS is configured with Full (strict) encryption and Always Use HTTPS enabled.

## Repository Structure

```
zeropointprotocol/
├── src/
│   ├── pages/           # Main website pages
│   └── theme/           # Docusaurus theme customization
├── docs/                # Documentation pages
├── static/              # Static assets
├── scripts/             # Build scripts
└── docusaurus.config.js # Docusaurus configuration
```

## Contributing

This website is part of the Zeropoint Protocol project. For contribution guidelines, see the main project repository.
