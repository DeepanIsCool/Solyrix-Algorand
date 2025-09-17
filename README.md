# DecentralAI Platform

<div align="center">

![DecentralAI Logo](https://img.shields.io/badge/DecentralAI-Algorand-blue?style=for-the-badge&logo=algorand)

**A Decentralized AI Context Management Platform on Algorand**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Algorand](https://img.shields.io/badge/Blockchain-Algorand-black)](https://algorand.com/)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Contracts-Python-green)](https://python.org/)

[Live Demo](https://decentralai.netlify.app) • [Documentation](#documentation) • [API Reference](#api-reference) • [Contributing](#contributing)

</div>

## 🌟 Overview

DecentralAI is a revolutionary decentralized platform that enables AI developers and users to create, share, and monetize AI contexts, prompts, and configurations on the Algorand blockchain. Built with cutting-edge Web3 technologies, it provides a secure, transparent, and efficient marketplace for AI resources.

### 🎯 Key Features

- **🔐 Decentralized Storage**: IPFS integration for secure, distributed content storage
- **💰 Marketplace**: Buy and sell AI contexts with transparent revenue sharing (2.5% platform fee)
- **🏛️ Governance**: Token-based voting system for platform decisions
- **🔒 Encryption**: End-to-end encryption for sensitive AI contexts
- **📊 Analytics**: Comprehensive dashboard for creators and buyers
- **🌐 Multi-Wallet**: Support for Pera, Defly, Exodus, and KMD wallets
- **⚡ Real-time**: Live balance updates and transaction monitoring

## 🏗️ Architecture

### Smart Contracts (Algorand Python)
- **ContextRegistry**: Manages AI context metadata and ownership
- **LicenseManager**: Handles licensing, payments, and access control
- **GovernanceToken**: Powers the platform's governance system

### Frontend (React + TypeScript)
- **Modern UI/UX**: Built with Tailwind CSS and daisyUI
- **Wallet Integration**: Seamless connection with multiple Algorand wallets
- **IPFS Integration**: Direct file uploads and retrieval
- **Real-time Updates**: Live balance and transaction monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0
- **npm** >= 9.0
- **Python** >= 3.12
- **Poetry** (for Python dependency management)
- **AlgoKit** CLI tool

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeepanIsCool/Solyrix-Algorand.git
   cd Solyrix-Algorand/Solyrix-Algorand
   ```

2. **Install AlgoKit** (if not already installed)
   ```bash
   pip install algokit
   ```

3. **Bootstrap the project**
   ```bash
   algokit project bootstrap all
   ```

4. **Set up environment variables**
   ```bash
   cd projects/Solyrix-Algorand-frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

### 🔧 Configuration

#### Frontend Environment Variables

Create `.env.local` in the frontend project:

```env
# Algorand Network Configuration
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443

# Smart Contract App IDs (updated after deployment)
VITE_CONTEXT_REGISTRY_APP_ID=your_context_registry_id
VITE_LICENSE_MANAGER_APP_ID=your_license_manager_id
VITE_GOVERNANCE_TOKEN_APP_ID=your_governance_token_id

# IPFS Configuration (Pinata)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key

# Application Configuration
VITE_APP_NAME=DecentralAI
VITE_APP_VERSION=1.0.0
```

#### IPFS Setup (Pinata)

1. Sign up at [Pinata Cloud](https://app.pinata.cloud/register)
2. Navigate to API Keys section
3. Create a new API key with appropriate permissions
4. Update your `.env.local` with the credentials

### 🏃‍♂️ Running the Application

#### Development Mode

1. **Start the frontend**
   ```bash
   cd projects/Solyrix-Algorand-frontend
   npm run dev
   ```

2. **Build smart contracts** (in another terminal)
   ```bash
   cd projects/Solyrix-Algorand-contracts
   algokit project run build
   ```

3. **Deploy contracts to TestNet** (optional)
   ```bash
   python deploy_testnet.py
   ```

#### Production Build

```bash
# Build all projects
algokit project run build

# Build frontend for production
cd projects/Solyrix-Algorand-frontend
npm run build
```

## 📁 Project Structure

```
Solyrix-Algorand/
├── .algokit.toml                 # AlgoKit workspace configuration
├── projects/
│   ├── Solyrix-Algorand-contracts/    # Smart contracts (Python)
│   │   ├── smart_contracts/
│   │   │   ├── context_registry/      # Context management contract
│   │   │   ├── license_manager/       # Licensing and payments
│   │   │   ├── governance_token/      # Governance system
│   │   │   └── utils/                 # Shared utilities
│   │   ├── deploy_testnet.py          # TestNet deployment script
│   │   └── pyproject.toml             # Python dependencies
│   │
│   └── Solyrix-Algorand-frontend/     # React frontend
│       ├── src/
│       │   ├── components/            # Reusable UI components
│       │   ├── pages/                 # Application pages
│       │   ├── hooks/                 # Custom React hooks
│       │   ├── services/              # API and blockchain services
│       │   ├── utils/                 # Utility functions
│       │   └── types/                 # TypeScript type definitions
│       ├── package.json               # Node.js dependencies
│       └── vite.config.ts             # Vite configuration
│
└── README.md                     # This file
```

## 🔗 Smart Contracts

### ContextRegistry Contract

Manages AI context metadata and ownership on the Algorand blockchain.

**Key Methods:**
- `create_context()` - Register new AI context
- `update_context()` - Update existing context
- `get_context_info()` - Retrieve context details
- `transfer_ownership()` - Transfer context ownership

### LicenseManager Contract

Handles licensing, payments, and access control for AI contexts.

**Key Methods:**
- `purchase_license()` - Buy access to AI context
- `verify_access()` - Check user access permissions
- `process_payment()` - Handle payment distribution
- `set_pricing()` - Update context pricing

### GovernanceToken Contract

Powers the platform's decentralized governance system.

**Key Methods:**
- `create_proposal()` - Submit governance proposal
- `vote()` - Cast vote on proposal
- `stake_tokens()` - Stake tokens for voting power
- `execute_proposal()` - Execute approved proposal

## 🎨 Frontend Features

### 🏪 Marketplace
- Browse and search AI contexts
- Advanced filtering by category, price, rating
- Detailed context previews
- Secure purchase flow with wallet integration

### 👤 User Profile
- Personal dashboard with statistics
- Context management (create, edit, delete)
- Purchase history and earnings tracking
- Account settings and preferences

### 🏛️ Governance
- View and create governance proposals
- Token staking for voting power
- Transparent voting process
- Proposal execution tracking

### 📝 Context Creation
- Step-by-step creation wizard
- IPFS upload with encryption options
- Flexible licensing configuration
- Preview and validation

## 🔐 Security Features

- **End-to-End Encryption**: Sensitive contexts encrypted before IPFS storage
- **Wallet Security**: Non-custodial wallet integration
- **Smart Contract Auditing**: Comprehensive testing and validation
- **Access Control**: Role-based permissions system
- **Secure Payments**: Atomic transactions on Algorand

## 🌐 API Reference

### Blockchain Service

```typescript
// Get context information
const context = await blockchainService.getContext(contextId);

// Purchase context license
const txn = await blockchainService.purchaseLicense(contextId, price);

// Create new context
const result = await blockchainService.createContext(metadata);
```

### IPFS Service

```typescript
// Upload file to IPFS
const hash = await ipfsService.uploadFile(file, options);

// Retrieve file from IPFS
const content = await ipfsService.getFile(hash);

// Upload encrypted content
const encryptedHash = await ipfsService.uploadEncrypted(content, key);
```

## 🧪 Testing

### Smart Contracts

```bash
cd projects/Solyrix-Algorand-contracts
algokit project run test
```

### Frontend

```bash
cd projects/Solyrix-Algorand-frontend
npm test
```

### End-to-End Testing

```bash
# Start local Algorand network
algokit localnet start

# Deploy contracts to LocalNet
python deploy_simple.py

# Run frontend tests
npm run test:e2e
```

## 📊 Performance Metrics

- **Transaction Speed**: ~4.5 seconds (Algorand finality)
- **Storage Cost**: ~$0.001 per KB on IPFS
- **Platform Fee**: 2.5% on marketplace transactions
- **Gas Fees**: Minimal (~0.001 ALGO per transaction)

## 🚀 Deployment

### TestNet Deployment

1. **Fund your account** with TestNet ALGO from the [dispenser](https://testnet.algoexplorer.io/dispenser)

2. **Deploy smart contracts**
   ```bash
   cd projects/Solyrix-Algorand-contracts
   python deploy_testnet.py
   ```

3. **Update frontend configuration** with deployed contract IDs

4. **Build and deploy frontend**
   ```bash
   cd projects/Solyrix-Algorand-frontend
   npm run build
   # Deploy to your preferred hosting service
   ```

### MainNet Deployment

⚠️ **Warning**: MainNet deployment requires real ALGO tokens and careful testing.

1. **Generate production mnemonic**
   ```bash
   algokey generate
   ```

2. **Fund account** with sufficient ALGO for deployment

3. **Update environment** to MainNet configuration

4. **Deploy with production script**
   ```bash
   python deploy_mainnet.py
   ```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 standards
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** for the robust blockchain infrastructure
- **AlgoKit** team for excellent development tools
- **IPFS** for decentralized storage solutions
- **React** and **TypeScript** communities
- **Open source contributors** who made this project possible

## 📞 Support

- **Documentation**: [docs.decentralai.com](https://docs.decentralai.com)
- **Discord**: [Join our community](https://discord.gg/decentralai)
- **Email**: support@decentralai.com
- **Issues**: [GitHub Issues](https://github.com/DeepanIsCool/Solyrix-Algorand/issues)

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Smart contract development
- [x] Frontend implementation
- [x] Wallet integration
- [x] IPFS storage

### Phase 2: Advanced Features 🚧
- [ ] AI model integration
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] API marketplace

### Phase 3: Ecosystem Growth 📋
- [ ] Developer SDK
- [ ] Third-party integrations
- [ ] Enterprise features
- [ ] Global expansion

---

<div align="center">

**Built with ❤️ by the DecentralAI Team**

[Website](https://decentralai.com) • [Twitter](https://twitter.com/decentralai) • [LinkedIn](https://linkedin.com/company/decentralai)

</div>
