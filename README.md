# Zeropoint Protocol AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> **Zeroth Principle**: Only with good intent and a good heart does the system function.

## 🌟 Overview

Zeropoint Protocol AI is an advanced AI system that combines distributed machine learning, ethical AI governance, and decentralized identity management. The system features a dual-architecture with a Python backend for AI model inference and a NestJS API gateway for orchestration and security.

## 🏗️ Architecture

### Core Components

- **🤖 AI Backend (Python)**: Distributed text and image generation using Petals and Stable Diffusion
- **🌐 API Gateway (NestJS)**: RESTful API with JWT authentication and rate limiting
- **🔗 IPFS Integration**: Decentralized file storage and content addressing
- **⚡ Soulchain**: Ethical AI governance and intent validation
- **📊 Monitoring**: Prometheus metrics and health checks

### Technology Stack

```
Frontend/API Gateway:
├── NestJS (TypeScript)
├── JWT Authentication
├── Rate Limiting
├── Prometheus Metrics
└── Helia IPFS Client

AI Backend:
├── Python 3.12+
├── Petals (Distributed BLOOM)
├── Stable Diffusion
├── Sanic Web Framework
└── IPFS Integration

Infrastructure:
├── Docker & Docker Compose
├── PostgreSQL Database
├── Redis Cache
├── IPFS Node
└── Prometheus Monitoring
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (optional, for full deployment)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/FlynnVIN10/zeropointprotocol.ai.git
   cd zeropointprotocol.ai
   ```

2. **Start Python AI Backend**
   ```bash
   cd Zeropoint
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app_simple.py
   ```
   The AI service will be available at `http://localhost:8000`

3. **Start NestJS API Gateway**
   ```bash
   cd ..
   npm install
   export JWT_SECRET="your-secret-key"
   export JWT_EXPIRES_IN="24h"
   export NODE_ENV="development"
   npm run start
   ```
   The API gateway will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📡 API Endpoints

### Health & Status
- `GET /v1/health` - Service health check
- `GET /v1/status` - System status and metrics
- `GET /v1/metrics` - Prometheus metrics

### AI Generation
- `POST /v1/generate/text` - Text generation with BLOOM
- `POST /v1/generate/image` - Image generation with Stable Diffusion
- `POST /v1/generate/code` - Code generation

### IPFS Operations
- `POST /v1/ipfs/upload` - Upload files to IPFS
- `GET /v1/ipfs/download/:cid` - Download files from IPFS
- `GET /v1/ipfs/list/:cid` - List IPFS directory contents

### Authentication (when database is enabled)
- `POST /v1/register` - User registration
- `POST /v1/login` - User authentication

## 🔧 Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=zeropoint
DATABASE_PASSWORD=zeropoint_password
DATABASE_NAME=zeropoint_protocol

# Service URLs
ZEROPOINT_SERVICE_URL=http://localhost:8000
IPFS_GATEWAY_URL=http://localhost:5001

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

## 🧪 Testing

### Python Backend Tests
```bash
cd Zeropoint
python -m pytest test_zeropoint_service.py
```

### NestJS API Tests
```bash
npm run test
npm run test:e2e
```

## 📊 Monitoring

### Health Checks
- **API Gateway**: `http://localhost:3000/v1/health`
- **AI Backend**: `http://localhost:8000/health`
- **Database**: Automatic connection monitoring
- **IPFS**: Node connectivity checks

### Metrics
- **Prometheus**: `http://localhost:9090`
- **API Metrics**: Request counts, latency, error rates
- **AI Metrics**: Model loading status, inference times
- **System Metrics**: CPU, memory, disk usage

## 🔒 Security Features

### Zeroth Gate Ethical Validation
- Intent validation for all AI operations
- Ethical compliance checking
- Malicious request blocking

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Rate limiting and throttling

### Data Protection
- IPFS content addressing
- Encrypted storage
- Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/ESLint rules
- Write comprehensive tests
- Update documentation
- Ensure ethical AI compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Petals Team**: Distributed BLOOM implementation
- **Hugging Face**: Transformers and Diffusers libraries
- **IPFS**: Decentralized file storage
- **NestJS**: Modern Node.js framework

## 📞 Support

- **Website**: [https://zeropointprotocol.ai](https://zeropointprotocol.ai)
- **Legal Inquiries**: legal@zeropointprotocol.ai
- **Documentation**: [https://zeropointprotocol.ai/docs](https://zeropointprotocol.ai/docs)

---

**Remember**: Only with good intent and a good heart does the system function. 🌟
