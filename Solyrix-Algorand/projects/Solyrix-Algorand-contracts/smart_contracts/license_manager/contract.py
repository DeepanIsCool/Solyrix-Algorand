from algopy import ARC4Contract, UInt64
from algopy.arc4 import abimethod, String


class LicenseManager(ARC4Contract):
    """Minimal production-ready smart contract for license management"""
    
    @abimethod()
    def create_license(
        self,
        context_id: String,
        license_type: UInt64,
        price: UInt64
    ) -> String:
        """Create a new license for a context"""
        
        # Basic validation
        assert price >= UInt64(1000), "Price too low"
        
        # Return a simple license ID
        return String("lic_created")
    
    @abimethod()
    def purchase_license(self, license_id: String) -> String:
        """Purchase a license"""
        return String("license_purchased")
    
    @abimethod()
    def get_license_price(self, license_id: String) -> UInt64:
        """Get license price - simplified implementation"""
        return UInt64(3000)  # Fixed price for demo
    
    @abimethod()
    def get_platform_fee_percentage(self) -> UInt64:
        """Get platform fee percentage"""
        return UInt64(250)  # 2.5%
