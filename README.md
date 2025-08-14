# Zeropoint Protocol - Main Platform Repository

This repository contains the core Zeropoint Protocol platform implementation, including AI agents, consensus mechanisms, and the complete system architecture.

## Repository Structure

```
Zeropoint-Protocol/
├── license/                    # Licensing and legal documents
│   ├── CLA.md                 # Contributor License Agreement
│   ├── LEGAL.md               # Legal information
│   ├── LICENSE.md             # Main license file
│   ├── SECURITY.md            # Security policy
│   └── ZAA.md                 # Zeropoint AI Agreement
├── reports/                    # Status reports and documentation
│   ├── CTO_Scan_Report_Resolution_Complete.md
│   ├── PHASE_A_COMPLETION_SUMMARY.md
│   ├── PHASE_W_TASK2_AND_PHASE_R_COMPLETION_SUMMARY.md
│   ├── PHASE_W_TASK2_COMPLETION_REPORT.md
│   ├── PM_PHASE_X_COMPLETION_REPORT.md
│   ├── PM_REPOSITORY_ACCESS_INSTRUCTIONS.md
│   └── PM_STATUS_REPORT.md
├── iaai/                       # All platform code and configuration
│   ├── app/                   # Application components
│   ├── artifacts/             # Generated artifacts
│   ├── audit-logs/            # System audit logs
│   ├── config/                # Configuration files
│   ├── data/                  # Data storage
│   ├── datasets/              # Training datasets
│   ├── demos/                 # Demonstration code
│   ├── docs/                  # Documentation
│   ├── migrations/            # Database migrations
│   ├── monitoring/            # System monitoring
│   ├── nginx/                 # Web server configuration
│   ├── ops/                   # Operations and deployment
│   ├── platform/              # Core platform code
│   ├── runtime/               # Runtime components
│   ├── scripts/               # Build and utility scripts
│   ├── src/                   # Source code
│   ├── test/                  # Test suites
│   ├── vendor/                # Third-party dependencies
│   ├── website/               # Website implementations
│   ├── website-deploy/        # Website deployment configs
│   ├── website-v2/            # Website version 2
│   ├── website-v2-deploy/     # Website v2 deployment
│   ├── website-legacy-archive/# Legacy website code
│   ├── Zeropoint/             # Zeropoint-specific components
│   ├── package.json           # Node.js dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── docker-compose.yml     # Docker configuration
│   └── .env                   # Environment variables
├── .github/                    # GitHub workflows and templates
├── .git/                       # Git repository data
├── contributors.txt            # Contributor list
├── Flynn_Resume.md            # Team member information
└── README.md                   # This file
```

## Quick Start

### Platform Development
```bash
cd iaai
npm install
npm run dev
```

### Website Development
```bash
cd iaai/website
npm install
npm run dev
```

### Platform Build
```bash
cd iaai
npm run build
```

## License

All licensing information is available in the `license/` folder. Please review the appropriate documents before contributing or using this codebase.

## Reports

Project status reports, phase completions, and strategic priorities are maintained in the `reports/` folder.

## Platform Components

The main platform implementation is located in the `iaai/` folder, which contains:

- **Core Platform**: AI agents, consensus mechanisms, and system architecture
- **Runtime Components**: Execution environment and monitoring
- **Documentation**: Comprehensive platform documentation
- **Website Implementations**: Multiple website versions and configurations
- **Operations**: Deployment, monitoring, and maintenance tools

## Contact

For questions about the platform or this repository, contact the development team.
