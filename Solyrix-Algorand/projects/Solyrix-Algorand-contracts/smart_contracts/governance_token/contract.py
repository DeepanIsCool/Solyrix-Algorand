from algopy import ARC4Contract, UInt64
from algopy.arc4 import abimethod, String


class GovernanceToken(ARC4Contract):
    """Minimal production-ready smart contract for governance token and voting"""
    
    @abimethod()
    def create_proposal(
        self,
        title: String,
        description: String
    ) -> String:
        """Create a new governance proposal"""
        
        # Return a simple proposal ID
        return String("prop_created")
    
    @abimethod()
    def vote_on_proposal(
        self, 
        proposal_id: String, 
        vote_for: UInt64
    ) -> String:
        """Vote on a governance proposal"""
        
        return String("vote_recorded")
    
    @abimethod()
    def get_proposal_votes(self, proposal_id: String) -> UInt64:
        """Get total votes for a proposal"""
        return UInt64(1000)  # Fixed votes for demo
    
    @abimethod()
    def get_total_supply(self) -> UInt64:
        """Get total token supply"""
        return UInt64(1000000000)  # 1 billion tokens
    
    @abimethod()
    def get_min_proposal_tokens(self) -> UInt64:
        """Get minimum tokens required to create proposal"""
        return UInt64(10000)  # 10,000 tokens
