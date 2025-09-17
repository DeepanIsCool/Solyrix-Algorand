from algopy import Bytes, UInt64, op, subroutine
from .constants import PLATFORM_FEE_PERCENTAGE, MAX_RATING


@subroutine
def calculate_platform_fee(amount: UInt64) -> UInt64:
    """Calculate platform fee (2.5% of amount)"""
    return (amount * PLATFORM_FEE_PERCENTAGE) // 10000


@subroutine
def calculate_creator_amount(amount: UInt64) -> UInt64:
    """Calculate amount going to creator (97.5% of amount)"""
    return amount - calculate_platform_fee(amount)


@subroutine
def validate_rating(rating: UInt64) -> bool:
    """Validate rating is between 1 and 5"""
    return rating >= 1 and rating <= MAX_RATING


@subroutine
def generate_context_id(creator: Bytes, timestamp: UInt64) -> Bytes:
    """Generate unique context ID from creator address and timestamp"""
    return op.sha256(creator + op.itob(timestamp))


@subroutine
def validate_ipfs_hash(ipfs_hash: Bytes) -> bool:
    """Basic validation for IPFS hash format (should be 46 characters for v0)"""
    return op.len(ipfs_hash) == 46


@subroutine
def is_valid_address(address: Bytes) -> bool:
    """Validate Algorand address format"""
    return op.len(address) == 32
