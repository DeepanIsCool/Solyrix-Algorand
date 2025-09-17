# DecentralAI Smart Contract Deployment Guide

This guide will help you deploy the DecentralAI smart contracts to Algorand TestNet and enable real on-chain transactions.

## Prerequisites

1. **Funded TestNet Account**: You need an Algorand TestNet account with sufficient ALGO for deployment
2. **AlgoKit**: Make sure AlgoKit is installed and configured
3. **Python Environment**: Poetry should be set up for the contracts project

## Step 1: Get TestNet ALGO

1. Visit the [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
2. Enter your wallet address
3. Click "Dispense" to receive 10 TestNet ALGO

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the contracts directory:
```bash
cd projects/Solyrix-Algorand-contracts
cp .env.testnet .env
```

2. Add your deployer mnemonic to the `.env` file:
```
DEPLOYER_MNEMONIC="your 25-word mnemonic phrase here"
```

## Step 3: Deploy Smart Contracts

Run the deployment command:
```bash
algokit project deploy testnet
```

This will deploy:
- **ContextRegistry**: Manages AI context creation and purchases
- **LicenseManager**: Handles licensing and permissions
- **GovernanceToken**: Manages governance tokens and voting

## Step 4: Update Frontend Configuration

After successful deployment, update the frontend environment variables in `projects/Solyrix-Algorand-frontend/.env.local`:

```env
VITE_CONTEXT_REGISTRY_APP_ID=<deployed_app_id>
VITE_LICENSE_MANAGER_APP_ID=<deployed_app_id>
VITE_GOVERNANCE_TOKEN_APP_ID=<deployed_app_id>
```

## Step 5: Verify Deployment

1. Restart the frontend development server:
```bash
cd projects/Solyrix-Algorand-frontend
npm run dev
```

2. Visit the home page - you should see a green "Smart Contracts Deployed" status
3. Try creating a context or making a purchase - these will now be real blockchain transactions!

## Smart Contract Features

Once deployed, the following features will work with real on-chain transactions:

### ContextRegistry Contract
- `create_context(ipfs_hash, title, price)`: Create new AI contexts
- `purchase_context(context_id)`: Purchase access to contexts
- `get_context_price(context_id)`: Get context pricing
- `get_platform_fee_percentage()`: Get platform fees

### LicenseManager Contract
- License validation and management
- Revenue distribution
- Access control

### GovernanceToken Contract
- Token minting and distribution
- Governance voting
- Staking mechanisms

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Make sure your deployer account has enough ALGO
2. **Network Issues**: Verify you're connected to TestNet
3. **Environment Variables**: Double-check your mnemonic and app IDs

### Deployment Logs

Check the deployment logs for any errors:
```bash
algokit project deploy testnet --verbose
```

### Manual Verification

You can verify your deployed contracts on [AlgoExplorer TestNet](https://testnet.algoexplorer.io/) using the app IDs.

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit your mnemonic to version control
- Use environment variables for sensitive data
- Test thoroughly on TestNet before MainNet deployment
- The current contracts are for demonstration - audit before production use

## Next Steps

Once deployed:
1. Test all functionality with real transactions
2. Monitor contract performance and costs
3. Consider additional features and optimizations
4. Plan for MainNet deployment when ready

## Support

If you encounter issues:
1. Check the AlgoKit documentation
2. Review the smart contract code in `smart_contracts/`
3. Test individual contract methods
4. Verify network connectivity and account funding
