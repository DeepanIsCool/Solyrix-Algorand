import logging

from algopy import Account, Txn
from algosdk.v2client.algod import AlgodClient
from algosdk.v2client.indexer import IndexerClient

from smart_contracts.governance_token.contract import GovernanceToken

logger = logging.getLogger(__name__)


def deploy(
    algod_client: AlgodClient,
    indexer_client: IndexerClient,
    app_creator: Account,
    app_spec_dir: str,
    token_name: str = "DecentralAI",
    unit_name: str = "DAI",
    total_supply: int = 100_000_000,
    decimals: int = 6,
) -> None:
    """Deploy the Governance Token contract"""
    
    from algokit_utils import (
        ApplicationClient,
        ApplicationSpecification,
        DeployConfig,
        ensure_funded,
    )
    
    # Ensure the creator account is funded
    ensure_funded(
        algod_client,
        app_creator.address,
        min_spending_balance_micro_algos=5_000_000,  # 5 ALGO for deployment
        min_funding_increment_micro_algos=1_000_000,
    )
    
    # Load the application specification
    app_spec = ApplicationSpecification.from_json(f"{app_spec_dir}/governance_token.json")
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=app_spec,
        creator=app_creator,
    )
    
    # Deploy configuration
    deploy_config = DeployConfig(
        on_schema_break="replace",  # Replace if schema changes
        on_update="update_app",     # Update if logic changes
        allow_delete=False,         # Don't allow deletion
        allow_update=True,          # Allow updates
    )
    
    # Deploy the application
    app_result = app_client.deploy(
        deploy_config=deploy_config,
        template_vars={
            "ADMIN_ADDRESS": app_creator.address,
        }
    )
    
    logger.info(f"Governance Token deployed with App ID: {app_result.app.app_id}")
    logger.info(f"App Address: {app_result.app.app_address}")
    
    # Fund the application account for ASA creation and operations
    ensure_funded(
        algod_client,
        app_result.app.app_address,
        min_spending_balance_micro_algos=20_000_000,  # 20 ALGO for operations
        min_funding_increment_micro_algos=1_000_000,
    )
    
    # Create the governance token
    try:
        token_result = app_client.call(
            "create_governance_token",
            token_name=token_name,
            unit_name=unit_name,
            total_supply=total_supply,
            decimals=decimals,
        )
        
        # Extract the created asset ID from the transaction
        token_id = token_result.return_value
        logger.info(f"Governance Token created with Asset ID: {token_id}")
        
    except Exception as e:
        logger.warning(f"Failed to create governance token: {e}")
    
    return app_result
