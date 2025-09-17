#!/usr/bin/env python3
"""
Simple deployment script for DecentralAI smart contracts to TestNet
This deploys minimal versions for testing the frontend
"""

import os
from pathlib import Path
from algokit_utils import Account, get_algod_client
import algosdk
from algosdk.v2client import algod
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def deploy_minimal_contracts():
    """Deploy minimal smart contracts for testing"""
    
    # Get deployer account from mnemonic
    mnemonic = os.getenv("DEPLOYER_MNEMONIC")
    if not mnemonic:
        print("❌ DEPLOYER_MNEMONIC not set in .env file")
        print("Please add your TestNet mnemonic to the .env file")
        return False
    
    try:
        deployer = Account(private_key=algosdk.mnemonic.to_private_key(mnemonic))
    except Exception as e:
        print(f"❌ Invalid mnemonic: {e}")
        return False
    
    print(f"✅ Deployer address: {deployer.address}")
    
    # Create algod client for TestNet
    algod_client = algod.AlgodClient(
        algod_token="",
        algod_address="https://testnet-api.algonode.cloud",
        headers={"User-Agent": "py-algorand-sdk"}
    )
    
    # Check balance
    try:
        account_info = algod_client.account_info(deployer.address)
        balance = account_info['amount'] / 1_000_000
        print(f"✅ Balance: {balance} ALGO")
        
        if balance < 1:
            print("⚠️  Low balance! You need at least 1 ALGO for deployment")
            print("Get TestNet ALGO from: https://testnet.algoexplorer.io/dispenser")
            return False
    except Exception as e:
        print(f"❌ Error checking balance: {e}")
        return False
    
    # Deploy a simple test contract
    try:
        # Create a minimal smart contract
        approval_program = """
#pragma version 10
txn ApplicationID
int 0
==
bnz creation

// Handle app calls
txn OnCompletion
int NoOp
==
bnz handle_noop
int 1
return

creation:
int 1
return

handle_noop:
int 1
return
"""
        
        clear_program = """
#pragma version 10
int 1
return
"""
        
        # Compile the programs
        approval_compiled = algod_client.compile(approval_program)['result']
        clear_compiled = algod_client.compile(clear_program)['result']
        
        # Create the application
        sp = algod_client.suggested_params()
        
        txn = algosdk.future.transaction.ApplicationCreateTxn(
            sender=deployer.address,
            sp=sp,
            on_complete=algosdk.future.transaction.OnComplete.NoOpOC,
            approval_program=algosdk.base64_to_bytes(approval_compiled),
            clear_program=algosdk.base64_to_bytes(clear_compiled),
            global_schema=algosdk.future.transaction.StateSchema(1, 1),
            local_schema=algosdk.future.transaction.StateSchema(0, 0),
            note="DecentralAI Test Contract"
        )
        
        # Sign and send the transaction
        signed_txn = txn.sign(deployer.private_key)
        tx_id = algod_client.send_transaction(signed_txn)
        
        # Wait for confirmation
        result = algosdk.future.transaction.wait_for_confirmation(algod_client, tx_id, 4)
        app_id = result['application-index']
        
        print(f"✅ Test contract deployed! App ID: {app_id}")
        print(f"✅ Transaction ID: {tx_id}")
        
        # Update frontend .env.local with the app IDs
        frontend_env_path = Path(__file__).parent.parent / "Solyrix-Algorand-frontend" / ".env.local"
        
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                lines = f.readlines()
            
            # Update app IDs (using same ID for all contracts in test)
            updated_lines = []
            for line in lines:
                if line.startswith("VITE_CONTEXT_REGISTRY_APP_ID="):
                    updated_lines.append(f"VITE_CONTEXT_REGISTRY_APP_ID={app_id}\n")
                elif line.startswith("VITE_LICENSE_MANAGER_APP_ID="):
                    updated_lines.append(f"VITE_LICENSE_MANAGER_APP_ID={app_id}\n")
                elif line.startswith("VITE_GOVERNANCE_TOKEN_APP_ID="):
                    updated_lines.append(f"VITE_GOVERNANCE_TOKEN_APP_ID={app_id}\n")
                else:
                    updated_lines.append(line)
            
            with open(frontend_env_path, 'w') as f:
                f.writelines(updated_lines)
            
            print(f"✅ Updated frontend environment variables!")
            print("\n📌 Next steps:")
            print("1. Restart the frontend dev server")
            print("2. The deployment warning should be gone")
            print("3. You can now test the UI with deployed contracts")
        
        return True
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Deploying minimal test contracts to TestNet...")
    success = deploy_minimal_contracts()
    
    if not success:
        print("\n⚠️  Deployment failed. Please check the errors above.")
