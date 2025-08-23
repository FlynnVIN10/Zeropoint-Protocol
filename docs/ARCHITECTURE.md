# Zeropoint Protocol Architecture

## Overview
Zeropoint Protocol is a secure, ethical AI ecosystem built on the Zeroth Principle: "Only with good intent and a good heart does the system function."

## Core Components

### Frontend
- **Static Site**: Cloudflare Pages deployment from `/public/` directory
- **Status Pages**: Health, ready, version, training, petals, wondercraft
- **Evidence Display**: Live commit tracking and build time injection

### Backend
- **Cloudflare Functions**: API endpoints for status, training, services
- **Training Pipeline**: TinyGrad integration with metrics collection
- **Service Status**: Petals and Wondercraft operational monitoring

### Infrastructure
- **Deployment**: Cloudflare Pages with auto-deploy workflow
- **CI/CD**: GitHub Actions for verification gates and evidence collection
- **Monitoring**: Daily probes and Lighthouse audits

## Directory Structure
```
/
├── public/           # Static site files (deployed to Cloudflare)
├── functions/        # Cloudflare Functions (API endpoints)
├── evidence/         # Verification evidence and compliance data
├── docs/            # Documentation and architecture
├── scripts/         # Build and deployment scripts
├── .github/         # GitHub Actions workflows
└── archive/         # Legacy/off-mission code
```

## Security & Compliance
- **Zeroth Principle**: Good intent and good heart requirement
- **Evidence Canonicalization**: Live commit and build time tracking
- **Verification Gates**: Automated compliance checking
- **Soulchain Logging**: Accountability and transparency

## Training Pipeline
- **Framework**: TinyGrad with PyTorch fallback
- **Metrics**: Epoch, step, loss, duration tracking
- **Scheduling**: 6-hour cron jobs with manual dispatch
- **Evidence**: Metrics stored in `/evidence/training/`

## Status Endpoints
- **Health**: `/api/healthz` - System health with commit info
- **Ready**: `/api/readyz` - Readiness status
- **Version**: `/status/version.json` - Build information
- **Training**: `/api/training/status` - Training pipeline status
- **Petals**: `/petals/status.json` - Distributed computing status
- **Wondercraft**: `/wondercraft/status.json` - AI service status
