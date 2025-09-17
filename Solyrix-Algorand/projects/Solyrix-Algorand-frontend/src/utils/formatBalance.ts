/**
 * Utility functions for formatting ALGO balances with exact precision
 */

/**
 * Format balance with exact precision, removing trailing zeros
 * @param balance - Balance in ALGO (not microAlgos)
 * @returns Formatted balance string without trailing zeros
 */
export const formatExactBalance = (balance: number): string => {
  // Remove trailing zeros but keep exact precision
  return balance.toString().replace(/\.?0+$/, '');
};

/**
 * Convert microAlgos to ALGO with exact precision
 * @param microAlgos - Amount in microAlgos
 * @returns Amount in ALGO with exact precision
 */
export const microAlgosToAlgo = (microAlgos: number): number => {
  return microAlgos / 1_000_000;
};

/**
 * Format microAlgos as ALGO with exact precision
 * @param microAlgos - Amount in microAlgos
 * @returns Formatted ALGO amount with exact precision
 */
export const formatMicroAlgosToAlgo = (microAlgos: number): string => {
  const algoAmount = microAlgosToAlgo(microAlgos);
  return formatExactBalance(algoAmount);
};

/**
 * Format price with exact precision (for display purposes)
 * @param price - Price in microAlgos
 * @returns Formatted price string with exact precision
 */
export const formatPrice = (price: number): string => {
  return formatMicroAlgosToAlgo(price);
};

/**
 * Format balance for display with exact precision
 * @param balance - Balance in microAlgos
 * @returns Formatted balance string with exact precision
 */
export const formatBalanceDisplay = (balance: number): string => {
  return formatMicroAlgosToAlgo(balance);
};
