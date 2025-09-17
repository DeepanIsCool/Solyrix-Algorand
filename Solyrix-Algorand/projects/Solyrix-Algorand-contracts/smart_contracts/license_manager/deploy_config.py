import logging

from algopy import Account, Txn
from algosdk.v2client.algod import AlgodClient
from algosdk.v2client.indexer import IndexerClient

from smart_contracts.license_manager.contract import LicenseManager

logger = logging.getLogger(__name__)


def deploy(
    algod_client: AlgodClient,
    indexer_client: IndexerClient,
    app_creator: Account,
    app_spec_dir: str,
    context_registry_app_id: int = None,
) -> None:
    """Deploy the License Manager contract"""
    
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
        min_spending_balance_micro_algos=3_000_000,  # 3 ALGO for deployment
        min_funding_increment_micro_algos=1_000_000,
    )
    
    # Load the application specification
    app_spec = ApplicationSpecification.from_json(f"{app_spec_dir}/license_manager.json")
    
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
    
    logger.info(f"License Manager deployed with App ID: {app_result.app.app_id}")
    logger.info(f"App Address: {app_result.app.app_address}")
    
    # Fund the application account for box storage and inner transactions
    ensure_funded(
        algod_client,
        app_result.app.app_address,
        min_spending_balance_micro_algos=15_000_000,  # 15 ALGO for operations
        min_funding_increment_micro_algos=1_000_000,
    )
    
    # Set context registry app ID if provided
    if context_registry_app_id:
        try:
            app_client.call(
                "set_context_registry",
                app_id=context_registry_app_id,
            )
            logger.info(f"Context Registry App ID set to: {context_registry_app_id}")
        except Exception as e:
            logger.warning(f"Failed to set context registry app ID: {e}")
    
    return app_result
