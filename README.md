# Zeropoint Protocol (View-Only)

**⚠️ VIEW-ONLY NOTICE: View only; no clone/download/fork/modify/run/redistribute without signed license. See [LICENSE.md](./LICENSE.md) for details.**

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

**⚠️ CONTRIBUTION POLICY: View-only; no PRs/forks/clones without signed agreement. Contact legal@zeropointprotocol.com for licensing inquiries.**

This project follows ethical AI principles with Zeroth-gate compliance. All contributions must align with responsible AI development practices.

### **Contribution Requirements**
- All contributions must pass ethical validation through the Zeroth-gate system
- Code must align with the Zeroth Principle: "Only with good intent and a good heart does the system function"
- Contributions must not enable harmful or malicious applications
- All code must respect human rights and dignity

### **Getting Started**
1. Contact legal@zeropointprotocol.com for licensing inquiries
2. Complete a signed license agreement
3. Follow the ethical guidelines and coding standards
4. Submit your contribution with appropriate documentation

For more information, see our [Contributing Guidelines](./CONTRIBUTING.md).

## 📄 **License**

### **View-Only License - © [2025] Zeropoint Protocol, LLC. All Rights Reserved.**

This software is provided for **VIEW-ONLY** purposes under a proprietary license. All rights are reserved by Zeropoint Protocol, LLC.

### **License Terms**

#### **PROHIBITED ACTIVITIES:**
- **Cloning** this repository
- **Downloading** the source code
- **Forking** this repository
- **Modifying** any code or documentation
- **Running** the software
- **Distributing** the software or any derivatives
- **Contributing** code or documentation
- **Creating derivative works**
- **Commercial use** of any kind

#### **PERMITTED ACTIVITIES:**
- **Viewing** the code and documentation on GitHub
- **Reading** the documentation for informational purposes
- **Contacting** us for licensing inquiries

### **License Requirements**
To obtain rights beyond view-only access, you must:
1. Contact legal@zeropointprotocol.com
2. Complete a signed license agreement
3. Receive written approval from Zeropoint Protocol, LLC
4. Comply with all terms and conditions of the signed agreement

### **Contact Information**
- **Legal Questions**: legal@zeropointprotocol.com
- **License Inquiries**: legal@zeropointprotocol.com
- **Website**: https://zeropointprotocol.com/legal

### **License Files**
- **[LICENSE.md](./LICENSE.md)**: Complete view-only license terms
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Contribution and access policy

### **License Summary**
```
© [2025] Zeropoint Protocol, LLC. All Rights Reserved.
View-Only License: No clone, modify, run or distribute without signed license.
See LICENSE.md for details.
```

For the complete license text, see [LICENSE.md](./LICENSE.md).
