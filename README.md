# Zeropoint Protocol - Agentic Consensus Platform

Zeropoint Protocol is an advanced AI system that combines distributed machine learning, ethical AI governance, and decentralized identity management. It is designed to facilitate agentic consensus through a dual-architecture system featuring a Python backend for AI model inference and a NestJS API gateway for orchestration and security. This repository contains the core platform, distinct from the corporate website hosted at [https://github.com/FlynnVIN10/zeropointprotocol.ai](https://github.com/FlynnVIN10/zeropointprotocol.ai).

## 🌟 Overview

**Zeroth Principle**: Only with good intent and a good heart does the system function.

The platform integrates:
- Distributed text and image generation using Petals and Stable Diffusion.
- Ethical AI governance via Zeroth-gate compliance.
- Decentralized file storage and content addressing with IPFS.
- Soulchain for intent validation and ethical compliance.
- Monitoring with Prometheus metrics and health checks.

## 🏗️ Architecture

### Core Components
- **AI Backend (Python)**: Distributed text and image generation.
- **API Gateway (NestJS)**: RESTful API with JWT authentication and rate limiting.
- **IPFS Integration**: Decentralized storage.
- **Soulchain**: Ethical governance and intent validation.
- **Monitoring**: Prometheus metrics and health checks.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker (optional)
- Git

### Local Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
   cd Zeropoint-Protocol
   ```
2. Start Python AI Backend:
   ```bash
   cd Zeropoint
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python app_simple.py
   ```
   AI service available at `http://localhost:8000`.
3. Start NestJS API Gateway:
   ```bash
   cd ..
   npm install
   export JWT_SECRET="your-secret-key"
   export JWT_EXPIRES_IN="24h"
   export NODE_ENV="development"
   npm run start
   ```
   API gateway available at `http://localhost:3000`.

## 📡 API Endpoints

### Health & Status
- `GET /v1/health`: Service health check.
- `GET /v1/status`: System status and metrics.
- `GET /v1/metrics`: Prometheus metrics.

### AI Generation
- `POST /v1/generate/text`: Text generation with BLOOM.
- `POST /v1/generate/image`: Image generation with Stable Diffusion.
- `POST /v1/generate/code`: Code generation.

## 🔒 Security Features
- **Zeroth Gate Ethical Validation**: Intent validation, ethical compliance, and malicious request blocking.
- **Authentication & Authorization**: JWT-based authentication, role-based access control, rate limiting.

## 🤝 Contributing
- **Policy**: View-only; no PRs/forks/clones without signed agreement. Contact [legal@zeropointprotocol.ai](mailto:legal@zeropointprotocol.ai) for licensing inquiries.
- **Requirements**: Contributions must pass Zeroth-gate ethical validation and align with the Zeroth Principle.

## 📑 License & Access
© 2025 Zeropoint Protocol, Inc., a Texas C Corporation. All Rights Reserved.  
View-Only License: No cloning, modifying, running, or distributing without a signed license. See [LICENSE.md](LICENSE.md).

## Relationship to Website
This repository hosts the core Zeropoint Protocol agentic consensus platform. For the corporate website, visit [https://github.com/FlynnVIN10/zeropointprotocol.ai](https://github.com/FlynnVIN10/zeropointprotocol.ai), which contains the Docusaurus-based static site for public-facing content.
