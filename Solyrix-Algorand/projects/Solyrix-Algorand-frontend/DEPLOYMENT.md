# DecentralAI Deployment Guide

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd projects/Solyrix-Algorand-frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: decentralai-platform
# - Directory: ./
# - Override settings? N
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to: `projects/Solyrix-Algorand-frontend`
5. Framework preset: Vite
6. Build command: `npm run build`
7. Output directory: `dist`
8. Install command: `npm install`

### Environment Variables for Vercel:
Add these in Vercel Dashboard → Settings → Environment Variables:
```
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
VITE_INDEXER_TOKEN=
VITE_CONTEXT_REGISTRY_APP_ID=628893739
VITE_LICENSE_MANAGER_APP_ID=628893740
VITE_GOVERNANCE_TOKEN_APP_ID=628893741
VITE_GOVERNANCE_TOKEN_ID=0
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_APP_NAME=DecentralAI
VITE_APP_VERSION=1.0.0
```

---

## 🌐 Deploy to Netlify

### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd projects/Solyrix-Algorand-frontend

# Build the project
npm run build

# Deploy
netlify deploy

# For production deployment
netlify deploy --prod
```

### Option 2: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set base directory to: `projects/Solyrix-Algorand-frontend`
5. Build command: `npm run build`
6. Publish directory: `dist`

### Environment Variables for Netlify:
Add these in Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
VITE_INDEXER_TOKEN=
VITE_CONTEXT_REGISTRY_APP_ID=628893739
VITE_LICENSE_MANAGER_APP_ID=628893740
VITE_GOVERNANCE_TOKEN_APP_ID=628893741
VITE_GOVERNANCE_TOKEN_ID=0
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_APP_NAME=DecentralAI
VITE_APP_VERSION=1.0.0
```

---

## 📋 Pre-Deployment Checklist

### 1. Test Local Build
```bash
cd projects/Solyrix-Algorand-frontend
npm run build
npm run preview
```

### 2. Update Smart Contract IDs
- Deploy your smart contracts to TestNet
- Update the App IDs in environment variables
- Test wallet connections on deployed site

### 3. Configure IPFS (Optional)
- Sign up for [Pinata](https://pinata.cloud)
- Get API keys
- Update VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY

### 4. Domain Configuration (Optional)
- **Vercel**: Add custom domain in project settings
- **Netlify**: Add custom domain in site settings

---

## 🔧 Troubleshooting

### Build Issues
- Ensure Node.js version 20+ is used
- Check that all dependencies are installed
- Verify environment variables are set correctly

### Wallet Connection Issues
- Ensure HTTPS is enabled (both platforms provide this automatically)
- Check that Algorand network configuration is correct
- Verify smart contract App IDs are valid

### Performance Optimization
- Both platforms automatically optimize builds
- Enable compression and caching (configured in netlify.toml/vercel.json)
- Consider using a CDN for static assets

---

## 🎯 Recommended Platform

**For DecentralAI, I recommend Vercel because:**
- Better performance for React/Vite applications
- Excellent developer experience
- Automatic HTTPS and global CDN
- Great integration with GitHub
- Superior build optimization
- Better handling of Web3 applications

**Netlify is also excellent and offers:**
- Generous free tier
- Great for static sites
- Excellent form handling
- Good performance
- Easy custom domain setup

Both platforms will work perfectly for your DecentralAI platform!
