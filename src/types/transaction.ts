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