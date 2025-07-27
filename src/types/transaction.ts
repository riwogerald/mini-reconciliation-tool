export interface Transaction {
  transaction_reference: string;
  amount: number;
  status: string;
  date?: string;
  description?: string;
  [key: string]: string | number | undefined;
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
  internalValue: string | number | undefined;
  providerValue: string | number | undefined;
}

export interface ReconciliationStats {
  totalInternal: number;
  totalProvider: number;
  matched: number;
  internalOnly: number;
  providerOnly: number;
  matchRate: number;
}