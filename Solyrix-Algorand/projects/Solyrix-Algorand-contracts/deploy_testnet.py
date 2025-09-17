#!/usr/bin/env python3
"""
Simple deployment script for DecentralAI smart contracts to TestNet
"""

import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
from algokit_utils import Account, AlgorandClient
from algokit_utils.config import config

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure AlgoKit
config.configure(debug=True, trace_all=False)

def get_deployer_account() -> Account:
    """Get the deployer account from mnemonic"""
    mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    if not mnemonic:
        raise ValueError("DEPLOYER_MNEMONIC environment variable not set")
    return Account.from_mnemonic(mnemonic)

def deploy_contracts():
    """Deploy all smart contracts to TestNet"""
    try:
        # Get deployer account
        deployer = get_deployer_account()
        logger.info(f"Deployer address: {deployer.address}")
        
        # Create Algorand client for TestNet
        algorand = AlgorandClient.testnet()
        
        # Check deployer balance
        account_info = algorand.client.algod.account_info(deployer.address)
        balance = account_info['amount'] / 1_000_000
        logger.info(f"Deployer balance: {balance} ALGO")
        
        if balance < 1:
            logger.warning("Low balance! Make sure you have enough ALGO for deployment")
        
        # TODO: Deploy contracts using the generated clients
        # For now, just log the deployment status
        logger.info("Smart contract deployment not yet implemented")
        logger.info("Please use AlgoKit to deploy the contracts manually:")
        logger.info("1. Set DEPLOYER_MNEMONIC environment variable")
        logger.info("2. Run: algokit project deploy testnet")
        
        return False
        
    except Exception as e:
        logger.error(f"Deployment failed: {e}")
        return False

def update_frontend_env(app_ids: dict):
    """Update frontend .env.local with deployed app IDs"""
    frontend_env_path = Path(__file__).parent.parent / "Solyrix-Algorand-frontend" / ".env.local"
    
    if not frontend_env_path.exists():
        logger.error(f"Frontend .env.local not found at {frontend_env_path}")
        return
    
    # Read current env file
    with open(frontend_env_path, 'r') as f:
        lines = f.readlines()
    
    # Update app IDs
    updated_lines = []
    for line in lines:
        if line.startswith("VITE_CONTEXT_REGISTRY_APP_ID="):
            updated_lines.append(f"VITE_CONTEXT_REGISTRY_APP_ID={app_ids.get('context_registry', 0)}\n")
        elif line.startswith("VITE_LICENSE_MANAGER_APP_ID="):
            updated_lines.append(f"VITE_LICENSE_MANAGER_APP_ID={app_ids.get('license_manager', 0)}\n")
        elif line.startswith("VITE_GOVERNANCE_TOKEN_APP_ID="):
            updated_lines.append(f"VITE_GOVERNANCE_TOKEN_APP_ID={app_ids.get('governance_token', 0)}\n")
        else:
            updated_lines.append(line)
    
    # Write updated env file
    with open(frontend_env_path, 'w') as f:
        f.writelines(updated_lines)
    
    logger.info(f"Updated frontend environment variables in {frontend_env_path}")

if __name__ == "__main__":
    logger.info("Starting DecentralAI smart contract deployment to TestNet...")
    
    success = deploy_contracts()
    
    if success:
        logger.info("✅ Deployment completed successfully!")
    else:
        logger.info("❌ Deployment not completed. Please deploy manually.")
        logger.info("\nTo deploy manually:")
        logger.info("1. Make sure you have a funded TestNet account")
        logger.info("2. Set DEPLOYER_MNEMONIC environment variable")
        logger.info("3. Run: algokit project deploy testnet")
        logger.info("4. Update the app IDs in frontend/.env.local")
