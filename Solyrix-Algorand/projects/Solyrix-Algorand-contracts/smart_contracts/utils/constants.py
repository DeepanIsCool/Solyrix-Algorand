# Constants for DecentralAI platform

# Context categories
CATEGORY_PROMPT = 0
CATEGORY_DATASET = 1
CATEGORY_MODEL_CONFIG = 2
CATEGORY_TOOL = 3

# Model types
MODEL_GPT = 0
MODEL_CLAUDE = 1
MODEL_LLAMA = 2
MODEL_UNIVERSAL = 3

# License types
LICENSE_ONE_TIME = 0
LICENSE_SUBSCRIPTION = 1
LICENSE_USAGE_BASED = 2
LICENSE_COMMERCIAL = 3

# Platform settings
PLATFORM_FEE_PERCENTAGE = 250  # 2.5% (in basis points)
MAX_TITLE_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 256
MIN_PRICE = 1000  # Minimum price in microAlgos
MAX_RATING = 5

# Box storage keys
CONTEXT_BOX_PREFIX = b"ctx_"
LICENSE_BOX_PREFIX = b"lic_"
USER_BOX_PREFIX = b"usr_"

# Governance settings
MIN_PROPOSAL_TOKENS = 1000000  # Minimum tokens to create proposal
VOTING_PERIOD = 604800  # 7 days in seconds
EXECUTION_DELAY = 86400  # 1 day in seconds
