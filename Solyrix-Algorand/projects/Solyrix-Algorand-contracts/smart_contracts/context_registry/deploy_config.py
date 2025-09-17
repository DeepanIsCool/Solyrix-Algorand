import logging

from algopy import Account, Txn
from algosdk.v2client.algod import AlgodClient
from algosdk.v2client.indexer import IndexerClient

from smart_contracts.context_registry.contract import ContextRegistry

logger = logging.getLogger(__name__)


def deploy(
    algod_client: AlgodClient,
    indexer_client: IndexerClient,
    app_creator: Account,
    app_spec_dir: str,
) -> None:
    """Deploy the Context Registry contract"""
    
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
        min_spending_balance_micro_algos=2_000_000,  # 2 ALGO for deployment
        min_funding_increment_micro_algos=1_000_000,
    )
    
    # Load the application specification
    app_spec = ApplicationSpecification.from_json(f"{app_spec_dir}/context_registry.json")
    
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
    
    logger.info(f"Context Registry deployed with App ID: {app_result.app.app_id}")
    logger.info(f"App Address: {app_result.app.app_address}")
    
    # Fund the application account for box storage
    ensure_funded(
        algod_client,
        app_result.app.app_address,
        min_spending_balance_micro_algos=10_000_000,  # 10 ALGO for box storage
        min_funding_increment_micro_algos=1_000_000,
    )
    
    return app_result
