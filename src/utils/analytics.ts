import { format, parseISO, subDays } from 'date-fns';
import { 
  ReconciliationResult, 
  BatchReconciliationResult, 
  Transaction, 
  TransactionMatch 
} from '../types/transaction';
import { 
  HistoricalRecord, 
  TrendData, 
  AnalyticsInsight, 
  AmountDistribution, 
  StatusBreakdown, 
  MismatchPattern, 
  AnalyticsData 
} from '../types/analytics';

/**
 * Generate analytics insights from reconciliation results
 */
export function generateInsights(
  currentResult: ReconciliationResult | BatchReconciliationResult,
  historicalRecords: HistoricalRecord[]
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Get current stats
  const currentStats = 'stats' in currentResult ? currentResult.stats : currentResult.aggregateStats;
  const matchRate = 'matchRate' in currentStats ? currentStats.matchRate : currentStats.overallMatchRate;

  // Match rate insight
  if (matchRate >= 95) {
    insights.push({
      id: 'high-match-rate',
      type: 'success',
      title: 'Excellent Match Rate',
      description: `Your reconciliation achieved a ${matchRate.toFixed(1)}% match rate, indicating strong data quality.`,
      value: `${matchRate.toFixed(1)}%`,
      impact: 'low',
      recommendation: 'Continue monitoring for consistency.'
    });
  } else if (matchRate >= 85) {
    insights.push({
      id: 'good-match-rate',
      type: 'info',
      title: 'Good Match Rate',
      description: `Match rate of ${matchRate.toFixed(1)}% is within acceptable range.`,
      value: `${matchRate.toFixed(1)}%`,
      impact: 'medium',
      recommendation: 'Review unmatched transactions for patterns.'
    });
  } else {
    insights.push({
      id: 'low-match-rate',
      type: 'warning',
      title: 'Low Match Rate Alert',
      description: `Match rate of ${matchRate.toFixed(1)}% is below optimal threshold.`,
      value: `${matchRate.toFixed(1)}%`,
      impact: 'high',
      recommendation: 'Investigate data quality issues and reconciliation processes.'
    });
  }

  // Volume analysis
  const totalTransactions = 'totalInternal' in currentStats ? 
    currentStats.totalInternal + currentStats.totalProvider :
    currentStats.totalTransactionsInternal + currentStats.totalTransactionsProvider;

  if (totalTransactions > 10000) {
    insights.push({
      id: 'high-volume',
      type: 'info',
      title: 'High Volume Processing',
      description: `Processed ${totalTransactions.toLocaleString()} transactions successfully.`,
      value: totalTransactions.toLocaleString(),
      impact: 'medium',
      recommendation: 'Consider implementing automated reconciliation for such volumes.'
    });
  }

  // Historical comparison
  if (historicalRecords.length >= 2) {
    const previousRecord = historicalRecords[historicalRecords.length - 2];
    const prevStats = 'stats' in previousRecord.result ? 
      previousRecord.result.stats : previousRecord.result.aggregateStats;
    const prevMatchRate = 'matchRate' in prevStats ? prevStats.matchRate : prevStats.overallMatchRate;

    const matchRateChange = matchRate - prevMatchRate;
    if (Math.abs(matchRateChange) >= 5) {
      insights.push({
        id: 'match-rate-trend',
        type: matchRateChange > 0 ? 'success' : 'warning',
        title: `Match Rate ${matchRateChange > 0 ? 'Improvement' : 'Decline'}`,
        description: `Match rate ${matchRateChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(matchRateChange).toFixed(1)}% compared to previous reconciliation.`,
        value: `${matchRateChange > 0 ? '+' : ''}${matchRateChange.toFixed(1)}%`,
        impact: Math.abs(matchRateChange) >= 10 ? 'high' : 'medium',
        recommendation: matchRateChange < 0 ? 'Investigate recent changes in data sources.' : 'Great progress! Maintain current processes.'
      });
    }
  }

  // Anomaly detection for batch results
  if ('aggregateStats' in currentResult && currentResult.aggregateStats.failedPairs > 0) {
    const failureRate = (currentResult.aggregateStats.failedPairs / currentResult.aggregateStats.totalFilePairs) * 100;
    insights.push({
      id: 'batch-failures',
      type: 'error',
      title: 'Batch Processing Failures',
      description: `${currentResult.aggregateStats.failedPairs} of ${currentResult.aggregateStats.totalFilePairs} file pairs failed to process.`,
      value: `${failureRate.toFixed(1)}%`,
      impact: failureRate > 20 ? 'high' : 'medium',
      recommendation: 'Review failed pairs for data format issues or corrupted files.'
    });
  }

  return insights;
}

/**
 * Calculate amount distribution ranges
 */
export function calculateAmountDistribution(transactions: Transaction[]): AmountDistribution[] {
  const ranges = [
    { min: 0, max: 10, label: '$0 - $10' },
    { min: 10, max: 50, label: '$10 - $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 500, label: '$100 - $500' },
    { min: 500, max: 1000, label: '$500 - $1K' },
    { min: 1000, max: 5000, label: '$1K - $5K' },
    { min: 5000, max: Infinity, label: '$5K+' }
  ];

  const distribution = ranges.map(range => ({
    range: range.label,
    count: 0,
    percentage: 0
  }));

  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    const rangeIndex = ranges.findIndex(range => amount >= range.min && amount < range.max);
    if (rangeIndex !== -1) {
      distribution[rangeIndex].count++;
    }
  });

  // Calculate percentages
  const total = transactions.length;
  distribution.forEach(item => {
    item.percentage = total > 0 ? (item.count / total) * 100 : 0;
  });

  return distribution.filter(item => item.count > 0);
}

/**
 * Analyze transaction status breakdown
 */
export function calculateStatusBreakdown(transactions: Transaction[]): StatusBreakdown[] {
  const statusMap = new Map<string, { count: number; totalAmount: number }>();

  transactions.forEach(transaction => {
    const status = transaction.status || 'unknown';
    const current = statusMap.get(status) || { count: 0, totalAmount: 0 };
    statusMap.set(status, {
      count: current.count + 1,
      totalAmount: current.totalAmount + Math.abs(transaction.amount)
    });
  });

  const breakdown: StatusBreakdown[] = [];
  const total = transactions.length;

  statusMap.forEach((data, status) => {
    breakdown.push({
      status,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      averageAmount: data.count > 0 ? data.totalAmount / data.count : 0
    });
  });

  return breakdown.sort((a, b) => b.count - a.count);
}

/**
 * Analyze mismatch patterns from matched transactions
 */
export function analyzeMismatchPatterns(matches: TransactionMatch[]): MismatchPattern[] {
  const fieldMismatches = new Map<string, { count: number; examples: Set<string> }>();

  matches.forEach(match => {
    match.mismatches.forEach(mismatch => {
      const current = fieldMismatches.get(mismatch.field) || { count: 0, examples: new Set() };
      fieldMismatches.set(mismatch.field, {
        count: current.count + 1,
        examples: current.examples.add(`${mismatch.internalValue} vs ${mismatch.providerValue}`)
      });
    });
  });

  const patterns: MismatchPattern[] = [];
  const totalMismatches = Array.from(fieldMismatches.values()).reduce((sum, data) => sum + data.count, 0);

  fieldMismatches.forEach((data, field) => {
    patterns.push({
      field,
      frequency: data.count,
      percentage: totalMismatches > 0 ? (data.count / totalMismatches) * 100 : 0,
      examples: Array.from(data.examples).slice(0, 3) // Top 3 examples
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Generate historical trend data
 */
export function generateTrendData(historicalRecords: HistoricalRecord[]): TrendData[] {
  return historicalRecords.map(record => {
    const stats = 'stats' in record.result ? record.result.stats : record.result.aggregateStats;
    const matchRate = 'matchRate' in stats ? stats.matchRate : stats.overallMatchRate;
    const totalTransactions = 'totalInternal' in stats ? 
      stats.totalInternal + stats.totalProvider :
      stats.totalTransactionsInternal + stats.totalTransactionsProvider;
    const totalMatched = 'matched' in stats ? stats.matched : stats.totalMatched;
    const totalDiscrepancies = 'internalOnly' in stats ?
      stats.internalOnly + stats.providerOnly :
      stats.totalInternalOnly + stats.totalProviderOnly;

    return {
      date: format(record.timestamp, 'MMM dd, yyyy'),
      matchRate,
      totalTransactions,
      totalMatched,
      totalDiscrepancies
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Detect anomalies in reconciliation data
 */
export function detectAnomalies(
  currentResult: ReconciliationResult | BatchReconciliationResult,
  historicalRecords: HistoricalRecord[],
  threshold: number = 10
): AnalyticsInsight[] {
  const anomalies: AnalyticsInsight[] = [];

  if (historicalRecords.length < 3) return anomalies; // Need enough history

  // Calculate historical averages
  const historicalMatchRates = historicalRecords.map(record => {
    const stats = 'stats' in record.result ? record.result.stats : record.result.aggregateStats;
    return 'matchRate' in stats ? stats.matchRate : stats.overallMatchRate;
  });

  const avgMatchRate = historicalMatchRates.reduce((sum, rate) => sum + rate, 0) / historicalMatchRates.length;
  const currentStats = 'stats' in currentResult ? currentResult.stats : currentResult.aggregateStats;
  const currentMatchRate = 'matchRate' in currentStats ? currentStats.matchRate : currentStats.overallMatchRate;

  // Detect match rate anomaly
  const matchRateDeviation = Math.abs(currentMatchRate - avgMatchRate);
  if (matchRateDeviation > threshold) {
    anomalies.push({
      id: 'match-rate-anomaly',
      type: currentMatchRate < avgMatchRate ? 'error' : 'info',
      title: 'Unusual Match Rate Detected',
      description: `Current match rate (${currentMatchRate.toFixed(1)}%) deviates significantly from historical average (${avgMatchRate.toFixed(1)}%).`,
      value: `${matchRateDeviation.toFixed(1)}% deviation`,
      impact: 'high',
      recommendation: currentMatchRate < avgMatchRate ? 
        'Investigate potential data quality issues or system changes.' :
        'Excellent improvement! Document what contributed to this enhancement.'
    });
  }

  return anomalies;
}

/**
 * Generate executive summary insights
 */
export function generateExecutiveSummary(analyticsData: AnalyticsData): string {
  const { performanceMetrics, insights } = analyticsData;
  const criticalInsights = insights.filter(i => i.impact === 'high');
  
  let summary = `Executive Summary:\n\n`;
  
  summary += `• Processed ${performanceMetrics.totalTransactionsProcessed.toLocaleString()} transactions across ${performanceMetrics.totalReconciliations} reconciliation sessions\n`;
  summary += `• Average match rate: ${performanceMetrics.averageMatchRate.toFixed(1)}%\n`;
  summary += `• Average processing time: ${performanceMetrics.averageProcessingTime.toFixed(2)}ms per transaction\n\n`;
  
  if (criticalInsights.length > 0) {
    summary += `Key Areas for Attention:\n`;
    criticalInsights.forEach(insight => {
      summary += `• ${insight.title}: ${insight.description}\n`;
    });
  } else {
    summary += `System Performance: All metrics are within acceptable ranges. No critical issues detected.\n`;
  }

  return summary;
}

/**
 * Calculate performance benchmarks
 */
export function calculatePerformanceMetrics(historicalRecords: HistoricalRecord[]): {
  averageProcessingTime: number;
  averageMatchRate: number;
  totalReconciliations: number;
  totalTransactionsProcessed: number;
  lastUpdated: Date;
} {
  if (historicalRecords.length === 0) {
    return {
      averageProcessingTime: 0,
      averageMatchRate: 0,
      totalReconciliations: 0,
      totalTransactionsProcessed: 0,
      lastUpdated: new Date()
    };
  }

  const totalProcessingTime = historicalRecords.reduce((sum, record) => sum + record.metadata.processingTimeMs, 0);
  const matchRates = historicalRecords.map(record => {
    const stats = 'stats' in record.result ? record.result.stats : record.result.aggregateStats;
    return 'matchRate' in stats ? stats.matchRate : stats.overallMatchRate;
  });

  const totalTransactions = historicalRecords.reduce((sum, record) => {
    const stats = 'stats' in record.result ? record.result.stats : record.result.aggregateStats;
    return sum + ('totalInternal' in stats ? 
      stats.totalInternal + stats.totalProvider :
      stats.totalTransactionsInternal + stats.totalTransactionsProvider);
  }, 0);

  return {
    averageProcessingTime: totalProcessingTime / historicalRecords.length,
    averageMatchRate: matchRates.reduce((sum, rate) => sum + rate, 0) / matchRates.length,
    totalReconciliations: historicalRecords.length,
    totalTransactionsProcessed: totalTransactions,
    lastUpdated: new Date()
  };
}

/**
 * Filter historical records by time range
 */
export function filterRecordsByTimeRange(
  records: HistoricalRecord[], 
  timeRange: '7d' | '30d' | '90d' | 'all'
): HistoricalRecord[] {
  if (timeRange === 'all') return records;

  const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange];
  const cutoffDate = subDays(new Date(), days);

  return records.filter(record => record.timestamp >= cutoffDate);
}

/**
 * Generate comprehensive analytics data
 */
export function generateAnalyticsData(
  currentResult: ReconciliationResult | BatchReconciliationResult,
  historicalRecords: HistoricalRecord[]
): AnalyticsData {
  // Get all transactions for analysis
  let allTransactions: Transaction[] = [];
  let allMatches: TransactionMatch[] = [];

  if ('stats' in currentResult) {
    // Single reconciliation result
    allTransactions = [
      ...currentResult.matched.map(m => m.internal),
      ...currentResult.internalOnly,
      ...currentResult.providerOnly
    ];
    allMatches = currentResult.matched;
  } else {
    // Batch reconciliation result
    currentResult.filePairs.forEach(pair => {
      if (pair.result) {
        allTransactions.push(
          ...pair.result.matched.map(m => m.internal),
          ...pair.result.internalOnly,
          ...pair.result.providerOnly
        );
        allMatches.push(...pair.result.matched);
      }
    });
  }

  return {
    historicalTrends: generateTrendData(historicalRecords),
    insights: [
      ...generateInsights(currentResult, historicalRecords),
      ...detectAnomalies(currentResult, historicalRecords)
    ],
    amountDistribution: calculateAmountDistribution(allTransactions),
    statusBreakdown: calculateStatusBreakdown(allTransactions),
    mismatchPatterns: analyzeMismatchPatterns(allMatches),
    performanceMetrics: calculatePerformanceMetrics(historicalRecords)
  };
}

/**
 * Generate chart-ready data for trend visualization
 */
export function prepareTrendChartData(trendData: TrendData[]) {
  return {
    labels: trendData.map(d => d.date),
    datasets: [
      {
        label: 'Match Rate (%)',
        data: trendData.map(d => d.matchRate),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Total Transactions',
        data: trendData.map(d => d.totalTransactions),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };
}

/**
 * Generate chart data for amount distribution
 */
export function prepareAmountDistributionChartData(distribution: AmountDistribution[]) {
  return {
    labels: distribution.map(d => d.range),
    datasets: [{
      label: 'Transaction Count',
      data: distribution.map(d => d.count),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(107, 114, 128, 0.8)',
        'rgba(139, 69, 19, 0.8)'
      ].slice(0, distribution.length),
      borderWidth: 1
    }]
  };
}

/**
 * Generate chart data for status breakdown
 */
export function prepareStatusBreakdownChartData(breakdown: StatusBreakdown[]) {
  return {
    labels: breakdown.map(s => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
    datasets: [{
      data: breakdown.map(s => s.percentage),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // completed - green
        'rgba(245, 158, 11, 0.8)',  // pending - yellow
        'rgba(239, 68, 68, 0.8)',   // failed - red
        'rgba(59, 130, 246, 0.8)',  // processing - blue
        'rgba(107, 114, 128, 0.8)'  // unknown - gray
      ],
      borderWidth: 1
    }]
  };
}
