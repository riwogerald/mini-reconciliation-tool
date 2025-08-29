import { ReconciliationResult, BatchReconciliationResult } from './transaction';

export interface HistoricalRecord {
  id: string;
  timestamp: Date;
  type: 'single' | 'batch';
  result: ReconciliationResult | BatchReconciliationResult;
  metadata: {
    internalFileName?: string;
    providerFileName?: string;
    filePairCount?: number;
    processingTimeMs: number;
  };
}

export interface TrendData {
  date: string;
  matchRate: number;
  totalTransactions: number;
  totalMatched: number;
  totalDiscrepancies: number;
}

export interface AnalyticsInsight {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  value?: string | number;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface AmountDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface MismatchPattern {
  field: string;
  frequency: number;
  percentage: number;
  examples: string[];
}

export interface AnalyticsData {
  historicalTrends: TrendData[];
  insights: AnalyticsInsight[];
  amountDistribution: AmountDistribution[];
  statusBreakdown: StatusBreakdown[];
  mismatchPatterns: MismatchPattern[];
  performanceMetrics: {
    averageProcessingTime: number;
    averageMatchRate: number;
    totalReconciliations: number;
    totalTransactionsProcessed: number;
    lastUpdated: Date;
  };
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  data: any;
  options: any;
}

export interface PDFReportOptions {
  includeCharts: boolean;
  includeInsights: boolean;
  includeDetailedBreakdown: boolean;
  reportTitle: string;
  generatedBy: string;
}

export interface AnalyticsPreferences {
  defaultTimeRange: '7d' | '30d' | '90d' | 'all';
  enableAutoInsights: boolean;
  anomalyThreshold: number;
  preferredChartTypes: string[];
}
