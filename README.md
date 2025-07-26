# Zeropoint Protocol

**Advanced AI Agent System with Ethical AI Principles**

Zeropoint Protocol is a comprehensive AI agent system featuring multi-agent collaboration, decentralized storage, and ethical AI principles with Zeroth-gate compliance.

## 🎯 **Core Features**

- **🤖 Multi-Agent Intelligence**: Swarm collaboration and collective cognition
- **🔗 Decentralized Storage**: IPFS-based ledger and persistent memory
- **⚖️ Ethical AI**: Zeroth-gate compliance for responsible AI development
- **🧠 Autopoietic Cognition**: Recursive self-training and adaptation
- **🎮 Gamified Experience**: XP progression and WonderCraft simulation
- **🔐 Secure Authentication**: JWT-based user management and protection

- All endpoints are versioned under `/v1/`.
- Proxy endpoints (e.g., `/v1/generate-text`) forward to Python backend using HttpModule.
- Persistent storage via PostgreSQL/TypeORM; User entity for registration/login.
- JWT authentication with `/v1/register`, `/v1/login`, and `/v1/protected` endpoints.
- Prometheus metrics exposed at `/v1/metrics` and `/v1/ledger-metrics`.
- All sensitive flows and endpoints are Zeroth-gated for ethical compliance.
- All secrets (DB, JWT, etc.) are loaded from environment variables (`process.env`).

## Example Usage

### Register
```bash
curl -X POST http://localhost:3000/v1/register -H 'Content-Type: application/json' -d '{"username":"user1","password":"pass1"}'
```

### Login
```bash
curl -X POST http://localhost:3000/v1/login -H 'Content-Type: application/json' -d '{"username":"user1","password":"pass1"}'
```

### Access Protected Route
```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/v1/protected
```

### Prometheus Metrics
```bash
curl http://localhost:3000/v1/metrics
curl http://localhost:3000/v1/ledger-metrics
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 20+
- PostgreSQL
- Docker & Docker Compose

### Installation
```bash
# Clone the repository
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol

# Install dependencies
npm install

# Start with Docker
docker-compose up -d

# Or start locally
npm run start:dev
```

## 🔧 **API Usage**

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/v1/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"user1","password":"pass1"}'

# Login
curl -X POST http://localhost:3000/v1/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"user1","password":"pass1"}'

# Access Protected Route
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/v1/protected
```

### Monitoring
```bash
# Prometheus Metrics
curl http://localhost:3000/v1/metrics
curl http://localhost:3000/v1/ledger-metrics

# Health Check
curl http://localhost:3000/v1/health
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

**Current Status:** 9/9 tests passing ✅

## 🏗️ **Architecture**

### **System Components**
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Storage**: IPFS (Helia client)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with ESM support
- **Authentication**: JWT with Passport

### **Agent Modules**
- **Introspection**: Self-reflection and dialogue layer
- **Simulation**: Gamified XP progression system
- **Swarm**: Multi-agent collaboration engine
- **Training**: Autopoietic cognition and self-training
- **Soulchain**: IPFS-based ledger and persistence

## 📚 **Documentation**

- **📋 PM Status Report**: [PM_STATUS_REPORT.md](./PM_STATUS_REPORT.md) - Project management and communication
- **🚀 Deployment Status**: [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Technical deployment details
- **🔧 API Documentation**: Coming soon

## 🤝 **Contributing**

This project follows ethical AI principles with Zeroth-gate compliance. All contributions must align with responsible AI development practices.

## 📄 **License**

See [LICENSE](./LICENSE) for details.
