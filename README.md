# Zeropoint Protocol Website v2

A modern, responsive website built with Next.js 14, featuring real-time monitoring, Control Center, and comprehensive documentation.

## Features

- **Modern UI/UX**: Built with Next.js 14, Tailwind CSS, and Radix UI
- **Control Center**: Real-time monitoring of system KPIs, Synthiants, Consensus, Metrics, and Audit
- **Documentation**: Nextra-powered documentation with search and navigation
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Data**: Placeholder for SSE/WebSocket integration
- **No Mocks**: Enforces real compute only with scope controls

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Documentation**: Nextra
- **Deployment**: Cloudflare Pages
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
   cd Zeropoint-Protocol/website-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
website-v2/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── control/           # Control Center routes
│   │   │   ├── overview/      # Main dashboard
│   │   │   ├── synthiants/    # AI agent monitoring
│   │   │   ├── consensus/     # Proposal tracking
│   │   │   ├── metrics/       # Performance metrics
│   │   │   └── audit/         # Audit timeline
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/             # Reusable components
│   │   └── Navigation.tsx     # Main navigation
│   └── globals.css            # Global styles
├── docs/                       # Nextra documentation
│   ├── index.mdx              # Documentation home
│   ├── getting-started.mdx    # Getting started guide
│   └── _meta.json             # Navigation metadata
├── public/                     # Static assets
├── next.config.js             # Next.js configuration
├── theme.config.tsx           # Nextra theme configuration
├── wrangler.toml              # Cloudflare Pages config
└── package.json               # Dependencies
```

## Control Center Routes

### `/control/overview`
- System KPIs and metrics
- Recent deployments
- Active incidents
- Quick action buttons

### `/control/synthiants`
- Active AI agents monitoring
- Queue statistics
- Chat sessions
- Performance metrics

### `/control/consensus`
- Active proposals
- Voting progress
- Quorum status
- Veto decisions

### `/control/metrics`
- Performance data
- Cost breakdown
- RAG metrics
- Real-time charts (placeholder)

### `/control/audit`
- System events timeline
- Security incidents
- Governance activities
- Detailed audit logs

## Documentation

The documentation is powered by Nextra and accessible at `/docs`. It includes:

- Getting started guides
- Installation instructions
- Configuration details
- API reference
- Contributing guidelines

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Responsive design principles

## Deployment

### Cloudflare Pages

The website is configured for deployment on Cloudflare Pages:

1. **Build Command**: `npm run build`
2. **Output Directory**: `.next`
3. **Node Version**: 18

### Environment Variables

Set the following environment variables in Cloudflare Pages:

```bash
NODE_VERSION=18
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

© 2025 Zeropoint Protocol, Inc., Austin, TX. All Rights Reserved.

## Support

- **Documentation**: Browse `/docs` for comprehensive guides
- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions

---

*Built with ❤️ by the Zeropoint Protocol team*
