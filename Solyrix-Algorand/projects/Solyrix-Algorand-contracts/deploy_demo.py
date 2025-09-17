#!/usr/bin/env python3
"""
Demo deployment - Updates frontend config to simulate deployed contracts
This is for demo purposes only - real deployment requires proper mnemonic
"""

import json
from pathlib import Path

def update_frontend_for_demo():
    """Update frontend to simulate deployed contracts for demo"""
    
    # Use demo app IDs (these are placeholder IDs for demo)
    # In production, these would be real deployed contract IDs
    demo_app_ids = {
        "context_registry": 628893739,  # Demo ID
        "license_manager": 628893740,   # Demo ID
        "governance_token": 628893741   # Demo ID
    }
    
    print("🚀 Setting up demo contract IDs...")
    
    # Update frontend .env.local with demo app IDs
    frontend_env_path = Path(__file__).parent.parent / "Solyrix-Algorand-frontend" / ".env.local"
    
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            lines = f.readlines()
        
        # Update app IDs
        updated_lines = []
        for line in lines:
            if line.startswith("VITE_CONTEXT_REGISTRY_APP_ID="):
                updated_lines.append(f"VITE_CONTEXT_REGISTRY_APP_ID={demo_app_ids['context_registry']}\n")
            elif line.startswith("VITE_LICENSE_MANAGER_APP_ID="):
                updated_lines.append(f"VITE_LICENSE_MANAGER_APP_ID={demo_app_ids['license_manager']}\n")
            elif line.startswith("VITE_GOVERNANCE_TOKEN_APP_ID="):
                updated_lines.append(f"VITE_GOVERNANCE_TOKEN_APP_ID={demo_app_ids['governance_token']}\n")
            else:
                updated_lines.append(line)
        
        with open(frontend_env_path, 'w') as f:
            f.writelines(updated_lines)
        
        print(f"✅ Updated frontend environment variables!")
        print("\n📌 Demo Configuration Applied:")
        print(f"   Context Registry: {demo_app_ids['context_registry']}")
        print(f"   License Manager: {demo_app_ids['license_manager']}")
        print(f"   Governance Token: {demo_app_ids['governance_token']}")
        print("\n✨ Next steps:")
        print("   1. Restart the frontend dev server")
        print("   2. The deployment warning will be gone")
        print("   3. You can demo the UI with simulated deployed contracts")
        print("\n⚠️  Note: These are demo IDs. For real deployment:")
        print("   - Get TestNet ALGO from the dispenser")
        print("   - Create a real mnemonic with: algokey generate")
        print("   - Deploy actual contracts to TestNet")
        
        return True
    else:
        print("❌ Frontend .env.local not found!")
        return False

if __name__ == "__main__":
    print("🎭 DecentralAI Demo Deployment")
    print("=" * 40)
    success = update_frontend_for_demo()
    
    if success:
        print("\n✅ Demo setup complete! The UI will now show contracts as deployed.")
    else:
        print("\n❌ Demo setup failed. Please check the errors above.")
