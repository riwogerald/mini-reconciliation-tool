import { Transaction, ReconciliationResult, TransactionMatch, FieldMismatch } from '../types/transaction';

/**
 * Enhanced reconciliation function with performance tracking
 */
export const reconcileTransactions = (
  internalData: Transaction[],
  providerData: Transaction[]
): { result: ReconciliationResult; processingTimeMs: number } => {
  const startTime = performance.now();
  const matched: TransactionMatch[] = [];
  const internalOnly: Transaction[] = [];
  const providerOnly: Transaction[] = [];

  // Create maps for efficient lookups
  const internalMap = new Map<string, Transaction>();
  const providerMap = new Map<string, Transaction>();

  // Populate maps
  internalData.forEach(transaction => {
    const ref = transaction.transaction_reference.toString().trim();
    internalMap.set(ref, transaction);
  });

  providerData.forEach(transaction => {
    const ref = transaction.transaction_reference.toString().trim();
    providerMap.set(ref, transaction);
  });

  // Find matches and internal-only transactions
  internalMap.forEach((internalTx, ref) => {
    const providerTx = providerMap.get(ref);
    
    if (providerTx) {
      // Found a match - check for field mismatches
      const mismatches = findFieldMismatches(internalTx, providerTx);
      matched.push({
        internal: internalTx,
        provider: providerTx,
        mismatches
      });
      // Remove from provider map to avoid duplicates
      providerMap.delete(ref);
    } else {
      internalOnly.push(internalTx);
    }
  });

  // Remaining provider transactions are provider-only
  providerMap.forEach(providerTx => {
    providerOnly.push(providerTx);
  });

  // Calculate statistics
  const stats = {
    totalInternal: internalData.length,
    totalProvider: providerData.length,
    matched: matched.length,
    internalOnly: internalOnly.length,
    providerOnly: providerOnly.length,
    matchRate: internalData.length > 0 ? (matched.length / internalData.length) * 100 : 0
  };

  const endTime = performance.now();
  const processingTimeMs = endTime - startTime;

  const result: ReconciliationResult = {
    matched,
    internalOnly,
    providerOnly,
    stats
  };

  return {
    result,
    processingTimeMs
  };
};

const findFieldMismatches = (internal: Transaction, provider: Transaction): FieldMismatch[] => {
  const mismatches: FieldMismatch[] = [];
  const fieldsToCompare = ['amount', 'status', 'date'];

  fieldsToCompare.forEach(field => {
    const internalValue = internal[field];
    const providerValue = provider[field];

    // Skip if either value is undefined or null
    if (internalValue == null || providerValue == null) {
      return;
    }

    // Compare values (handle numeric comparison for amounts)
    let valuesMatch = false;
    if (field === 'amount') {
      const internalAmount = typeof internalValue === 'number' ? internalValue : parseFloat(internalValue);
      const providerAmount = typeof providerValue === 'number' ? providerValue : parseFloat(providerValue);
      valuesMatch = Math.abs(internalAmount - providerAmount) < 0.01; // Account for floating point precision
    } else {
      valuesMatch = internalValue.toString().toLowerCase() === providerValue.toString().toLowerCase();
    }

    if (!valuesMatch) {
      mismatches.push({
        field,
        internalValue,
        providerValue
      });
    }
  });

  return mismatches;
};