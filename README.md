⚠️ **Governance Directive** — All contributions require CTO/CEO dual consensus.
See [GOVERNANCE.md](./GOVERNANCE.md).

**Intent: "GOD FIRST, with good intent and a good heart."**

---

# Zeropoint Protocol

**Dual Consensus Agentic AI Platform** — The future of decentralized AI infrastructure.

This repository contains both the **Zeropoint Protocol platform** and the **official website** at [zeropointprotocol.ai](https://zeropointprotocol.ai).

## 🏗️ Repository Structure

```
Zeropoint-Protocol/
├── iaai/                   # Platform source code
├── app/                    # Website (Next.js App Router)
├── components/             # Website components
├── .github/                # GitHub workflows and config
├── .cloudflare/            # Deployment scripts
├── docs/                   # Documentation
├── directives/             # CTO directives
├── license/                # License documentation
├── reports/                # Project reports
├── scripts/                # Build and utility scripts
├── types/                  # TypeScript type definitions
├── lib/                    # Utility libraries
├── styles/                 # Design system styles
└── package.json            # Dependencies
```

## 🌐 Website

The official website is built with Next.js 14 and deployed to Cloudflare Pages.

### 🚀 Quick Start

#### Prerequisites
- Node.js 20.x or higher
- npm or yarn

#### Installation
```bash
npm install
```

#### Development
```bash
npm run dev
```

#### Build
```bash
npm run build
```

#### Testing
```bash
npm test
npm run test:watch
```

#### Linting
```bash
npm run lint
```

## 🧪 Testing

The project includes comprehensive testing with Jest and React Testing Library:

- **Unit Tests**: Component rendering and behavior
- **Integration Tests**: Page functionality
- **Accessibility Tests**: Lighthouse audits
- **Link Validation**: Internal and external link checking

## 🚀 Deployment

### Cloudflare Pages
The website is automatically deployed to Cloudflare Pages via GitHub Actions:

1. **CI Pipeline**: Runs on every PR and push to main
2. **Compliance Checks**: Enforces CTO directive requirements
3. **Automated Deployment**: Deploys to Cloudflare Pages on main branch merge

### Required Secrets
- `CLOUDFLARE_API_TOKEN`: API token for Cloudflare Pages
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME`: Cloudflare Pages project name

## 🔒 Compliance & Security

### CTO Directive Compliance
- ✅ **No Mocks**: MOCKS_DISABLED=1 enforced
- ✅ **No Timeframes**: Automated detection of planning promises
- ✅ **Forbidden Terms**: Automated detection of restricted terminology
- ✅ **Route Parity**: All required routes implemented and tested
- ✅ **Lighthouse Standards**: Accessibility ≥95, Best Practices ≥90, SEO ≥90

### Security Features
- **Dependency Scanning**: Automated vulnerability detection
- **Type Safety**: Full TypeScript implementation
- **Content Validation**: No placeholder or mock content
- **Link Security**: External link validation

## 📊 Performance Standards

### Lighthouse Targets
- **Performance**: ≥80
- **Accessibility**: ≥95
- **Best Practices**: ≥90
- **SEO**: ≥90

## 🤖 Platform Features

- **AI Agent Orchestration**: Advanced multi-agent systems
- **Dual Consensus**: Revolutionary dual consensus engine
- **Decentralized Storage**: IPFS-based storage system
- **Unreal Engine 5**: Advanced simulation and XR capabilities

## 📚 Documentation

- **API Reference**: `/docs/api`
- **Developer Guides**: `/docs/v1`
- **SDK Documentation**: `/library`
- **Legal Information**: `/legal`

## 🌟 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution instructions.

## 📄 License

This project is licensed under the terms specified in the [LICENSE.md](license/LICENSE.md) file.

---

**Zeropoint Protocol, Inc.** — Austin, TX  
© 2025 All Rights Reserved
# Trigger deployment
