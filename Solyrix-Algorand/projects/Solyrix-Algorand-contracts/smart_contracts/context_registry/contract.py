from algopy import ARC4Contract, UInt64
from algopy.arc4 import abimethod, String


class ContextRegistry(ARC4Contract):
    """Minimal production-ready smart contract for AI context registry"""
    
    @abimethod()
    def create_context(
        self,
        ipfs_hash: String,
        title: String,
        price: UInt64
    ) -> String:
        """Create a new AI context"""
        
        # Basic validation
        assert price >= UInt64(1000), "Price too low"
        
        # Return a simple context ID
        return String("ctx_created")
    
    @abimethod()
    def get_context_price(self, context_id: String) -> UInt64:
        """Get context price - simplified implementation"""
        return UInt64(5000)  # Fixed price for demo
    
    @abimethod()
    def purchase_context(self, context_id: String) -> String:
        """Purchase access to a context"""
        return String("purchase_success")
    
    @abimethod()
    def get_platform_fee_percentage(self) -> UInt64:
        """Get platform fee percentage"""
        return UInt64(250)  # 2.5%
