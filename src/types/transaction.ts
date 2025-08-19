export interface Transaction {
  transaction_reference: string;
  amount: number;
  status: string;
  date?: string;
  description?: string;
  [key: string]: any;
}

export interface ParsedFile {
  name: string;
  data: Transaction[];
  headers: string[];
  size: number;
}

export interface ReconciliationResult {
  matched: TransactionMatch[];
  internalOnly: Transaction[];
  providerOnly: Transaction[];
  stats: ReconciliationStats;
}

export interface TransactionMatch {
  internal: Transaction;
  provider: Transaction;
  mismatches: FieldMismatch[];
}

export interface FieldMismatch {
  field: string;
  internalValue: any;
  providerValue: any;
}

export interface ReconciliationStats {
  totalInternal: number;
  totalProvider: number;
  matched: number;
  internalOnly: number;
  providerOnly: number;
  matchRate: number;
}

// Batch Processing Types
export interface FilePair {
  id: string;
  internalFile: ParsedFile;
  providerFile: ParsedFile;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ReconciliationResult;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface BatchUploadState {
  internalFiles: ParsedFile[];
  providerFiles: ParsedFile[];
  filePairs: FilePair[];
  isProcessing: boolean;
  completedCount: number;
  totalCount: number;
}

export interface BatchReconciliationResult {
  filePairs: FilePair[];
  aggregateStats: BatchStats;
  processedAt: Date;
  processingTimeMs: number;
}

export interface BatchStats {
  totalFilePairs: number;
  successfulPairs: number;
  failedPairs: number;
  totalTransactionsInternal: number;
  totalTransactionsProvider: number;
  totalMatched: number;
  totalInternalOnly: number;
  totalProviderOnly: number;
  overallMatchRate: number;
  averageProcessingTime: number;
}

export type ProcessingMode = 'single' | 'batch';

export interface FileUploadError {
  fileName: string;
  error: string;
  timestamp: Date;
}
