import { FilePair, BatchReconciliationResult, BatchStats } from '../types/transaction';
import { reconcileTransactions } from './reconciliation';

export interface BatchProcessingCallbacks {
  onProgress?: (current: number, total: number, currentPair: FilePair) => void;
  onPairCompleted?: (pair: FilePair) => void;
  onPairFailed?: (pair: FilePair, error: string) => void;
}

/**
 * Process multiple file pairs for batch reconciliation
 */
export const processBatchReconciliation = async (
  filePairs: FilePair[],
  callbacks?: BatchProcessingCallbacks
): Promise<BatchReconciliationResult> => {
  const startTime = Date.now();
  const processedPairs: FilePair[] = [];

  // Process each file pair
  for (let i = 0; i < filePairs.length; i++) {
    const pair = filePairs[i];
    
    try {
      // Update status to processing
      pair.status = 'processing';
      callbacks?.onProgress?.(i + 1, filePairs.length, pair);

      // Add realistic processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Process the reconciliation
      const { result, processingTimeMs } = reconcileTransactions(
        pair.internalFile.data,
        pair.providerFile.data
      );

      // Update pair with results
      pair.status = 'completed';
      pair.result = result;
      pair.processedAt = new Date();

      callbacks?.onPairCompleted?.(pair);
    } catch (error) {
      // Handle processing error
      pair.status = 'failed';
      pair.error = error instanceof Error ? error.message : 'Unknown processing error';
      pair.processedAt = new Date();

      callbacks?.onPairFailed?.(pair, pair.error);
    }

    processedPairs.push(pair);
  }

  const endTime = Date.now();
  const processingTimeMs = endTime - startTime;

  // Calculate aggregate statistics
  const aggregateStats = calculateBatchStats(processedPairs, processingTimeMs);

  return {
    filePairs: processedPairs,
    aggregateStats,
    processedAt: new Date(),
    processingTimeMs
  };
};

/**
 * Calculate aggregate statistics across all processed file pairs
 */
export const calculateBatchStats = (filePairs: FilePair[], processingTimeMs: number): BatchStats => {
  const successfulPairs = filePairs.filter(pair => pair.status === 'completed' && pair.result);
  const failedPairs = filePairs.filter(pair => pair.status === 'failed');

  let totalTransactionsInternal = 0;
  let totalTransactionsProvider = 0;
  let totalMatched = 0;
  let totalInternalOnly = 0;
  let totalProviderOnly = 0;

  // Aggregate statistics from successful pairs
  successfulPairs.forEach(pair => {
    if (pair.result) {
      totalTransactionsInternal += pair.result.stats.totalInternal;
      totalTransactionsProvider += pair.result.stats.totalProvider;
      totalMatched += pair.result.stats.matched;
      totalInternalOnly += pair.result.stats.internalOnly;
      totalProviderOnly += pair.result.stats.providerOnly;
    }
  });

  const overallMatchRate = totalTransactionsInternal > 0 
    ? (totalMatched / totalTransactionsInternal) * 100 
    : 0;

  const averageProcessingTime = filePairs.length > 0 
    ? processingTimeMs / filePairs.length 
    : 0;

  return {
    totalFilePairs: filePairs.length,
    successfulPairs: successfulPairs.length,
    failedPairs: failedPairs.length,
    totalTransactionsInternal,
    totalTransactionsProvider,
    totalMatched,
    totalInternalOnly,
    totalProviderOnly,
    overallMatchRate,
    averageProcessingTime
  };
};

/**
 * Generate a summary report for batch processing results
 */
export const generateBatchSummaryReport = (result: BatchReconciliationResult): string => {
  const { aggregateStats, processingTimeMs, processedAt } = result;
  
  const report = [
    'BATCH RECONCILIATION SUMMARY',
    '================================',
    '',
    `Processing Date: ${processedAt.toLocaleString()}`,
    `Total Processing Time: ${(processingTimeMs / 1000).toFixed(2)} seconds`,
    `Average Time per Pair: ${(aggregateStats.averageProcessingTime / 1000).toFixed(2)} seconds`,
    '',
    'FILE PAIRS PROCESSED:',
    `- Total Pairs: ${aggregateStats.totalFilePairs}`,
    `- Successful: ${aggregateStats.successfulPairs}`,
    `- Failed: ${aggregateStats.failedPairs}`,
    '',
    'TRANSACTION SUMMARY:',
    `- Total Internal Transactions: ${aggregateStats.totalTransactionsInternal.toLocaleString()}`,
    `- Total Provider Transactions: ${aggregateStats.totalTransactionsProvider.toLocaleString()}`,
    `- Total Matched: ${aggregateStats.totalMatched.toLocaleString()}`,
    `- Internal Only: ${aggregateStats.totalInternalOnly.toLocaleString()}`,
    `- Provider Only: ${aggregateStats.totalProviderOnly.toLocaleString()}`,
    `- Overall Match Rate: ${aggregateStats.overallMatchRate.toFixed(2)}%`,
    ''
  ];

  // Add individual pair results
  if (result.filePairs.length > 0) {
    report.push('INDIVIDUAL PAIR RESULTS:');
    report.push('------------------------');
    result.filePairs.forEach((pair, index) => {
      report.push(`${index + 1}. ${pair.internalFile.name} ↔ ${pair.providerFile.name}`);
      if (pair.status === 'completed' && pair.result) {
        report.push(`   Status: ✅ Completed`);
        report.push(`   Matched: ${pair.result.stats.matched}/${pair.result.stats.totalInternal} (${pair.result.stats.matchRate.toFixed(1)}%)`);
      } else if (pair.status === 'failed') {
        report.push(`   Status: ❌ Failed - ${pair.error}`);
      }
      report.push('');
    });
  }

  return report.join('\n');
};

/**
 * Export batch results to downloadable files
 */
export const exportBatchResults = async (result: BatchReconciliationResult): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // Create a summary report
  const summaryReport = generateBatchSummaryReport(result);
  downloadTextFile(summaryReport, `batch-reconciliation-summary-${timestamp}.txt`);

  // Export individual reconciliation results as CSV
  const Papa = await import('papaparse');
  
  result.filePairs.forEach((pair, index) => {
    if (pair.status === 'completed' && pair.result) {
      const pairName = `pair-${index + 1}-${pair.internalFile.name.replace('.csv', '')}-${pair.providerFile.name.replace('.csv', '')}`;
      
      // Export matched transactions
      if (pair.result.matched.length > 0) {
        const matchedData = pair.result.matched.map(match => ({
          transaction_reference: match.internal.transaction_reference,
          internal_amount: match.internal.amount,
          provider_amount: match.provider.amount,
          internal_status: match.internal.status,
          provider_status: match.provider.status,
          internal_date: match.internal.date || '',
          provider_date: match.provider.date || '',
          internal_description: match.internal.description || '',
          provider_description: match.provider.description || '',
          has_mismatches: match.mismatches.length > 0 ? 'Yes' : 'No',
          mismatch_fields: match.mismatches.map(m => m.field).join(', ')
        }));
        
        const csv = Papa.unparse(matchedData, { header: true });
        downloadTextFile(csv, `${pairName}-matched-${timestamp}.csv`);
      }

      // Export internal-only transactions
      if (pair.result.internalOnly.length > 0) {
        const csv = Papa.unparse(pair.result.internalOnly, { header: true });
        downloadTextFile(csv, `${pairName}-internal-only-${timestamp}.csv`);
      }

      // Export provider-only transactions
      if (pair.result.providerOnly.length > 0) {
        const csv = Papa.unparse(pair.result.providerOnly, { header: true });
        downloadTextFile(csv, `${pairName}-provider-only-${timestamp}.csv`);
      }
    }
  });
};

/**
 * Helper function to download text content as a file
 */
const downloadTextFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Validate file pairs before processing
 */
export const validateFilePairs = (filePairs: FilePair[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (filePairs.length === 0) {
    errors.push('No file pairs available for processing');
    return { valid: false, errors };
  }

  filePairs.forEach((pair, index) => {
    if (!pair.internalFile || !pair.providerFile) {
      errors.push(`Pair ${index + 1}: Missing internal or provider file`);
    }

    if (pair.internalFile?.data.length === 0) {
      errors.push(`Pair ${index + 1}: Internal file "${pair.internalFile.name}" has no transaction data`);
    }

    if (pair.providerFile?.data.length === 0) {
      errors.push(`Pair ${index + 1}: Provider file "${pair.providerFile.name}" has no transaction data`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
