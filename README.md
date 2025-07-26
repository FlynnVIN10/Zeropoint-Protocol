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

### **Contribution Requirements**
- All contributions must pass ethical validation through the Zeroth-gate system
- Code must align with the Zeroth Principle: "Only with good intent and a good heart does the system function"
- Contributions must not enable harmful or malicious applications
- All code must respect human rights and dignity

### **Getting Started**
1. Read the [Contributor License Agreement (CLA)](./CLA.md)
2. Review the [Zeroth Alignment Addendum (ZAA)](./ZAA.md)
3. Follow the ethical guidelines and coding standards
4. Submit your contribution with appropriate documentation

For more information, see our [Contributing Guidelines](./CONTRIBUTING.md).

## 📄 **License**

### **GNU Affero General Public License v3 (AGPL v3) + Zeroth Alignment Addendum (ZAA)**

This project is licensed under the **GNU Affero General Public License v3 (AGPL v3)** with the **Zeroth Alignment Addendum (ZAA)**. This combination ensures both open-source freedom and ethical AI development.

### **Key License Features**

#### **AGPL v3 Benefits:**
- **Copyleft Protection**: Ensures derivatives remain open source
- **Network Use Provision**: Requires source code availability for network services
- **Patent Protection**: Includes patent license grants
- **Freedom Preservation**: Maintains user freedoms and rights

#### **ZAA Ethical Requirements:**
- **Zeroth Principle**: "Only with good intent and a good heart does the system function"
- **Intent Validation**: All operations must pass ethical validation
- **Benevolent Purpose**: Software may only be used for beneficial purposes
- **Prohibited Uses**: Explicit restrictions on harmful applications

### **License Compliance**

#### **For Users:**
- You may use, modify, and distribute the software
- You must provide source code when offering network services
- You must comply with ethical requirements in the ZAA
- You may not use the software for harmful purposes

#### **For Contributors:**
- All contributions are licensed under the same terms
- Contributors must agree to the [CLA](./CLA.md)
- Contributions must pass ethical validation
- Code must align with the Zeroth Principle

#### **For Distributors:**
- Must include the complete license text (AGPL v3 + ZAA)
- Must provide source code and installation information
- Must maintain ethical safeguards and Zeroth-gate system
- Must not enable harmful or malicious applications

### **License Files**
- **[LICENSE](./LICENSE)**: Complete AGPL v3 text with embedded ZAA
- **[ZAA.md](./ZAA.md)**: Standalone Zeroth Alignment Addendum
- **[CLA.md](./CLA.md)**: Contributor License Agreement

### **Contact Information**
- **Ethical Questions**: ethics@zeropointprotocol.org
- **Legal Questions**: legal@zeropointprotocol.org
- **License Questions**: license@zeropointprotocol.org

### **License Summary**
```
Copyright (C) 2024 Zeropoint Protocol Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

This software is also subject to the Zeroth Alignment Addendum (ZAA),
which requires ethical compliance and benevolent use only.
```

For the complete license text, see [LICENSE](./LICENSE).
