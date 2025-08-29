import { ReconciliationResult, BatchReconciliationResult } from '../types/transaction';
import { HistoricalRecord, AnalyticsPreferences } from '../types/analytics';

const STORAGE_KEYS = {
  HISTORICAL_RECORDS: 'mini-recon-tool-history',
  ANALYTICS_PREFERENCES: 'mini-recon-tool-preferences',
  APP_VERSION: 'mini-recon-tool-version'
} as const;

const CURRENT_VERSION = '1.1.0';
const MAX_HISTORICAL_RECORDS = 100; // Limit to prevent localStorage bloat

/**
 * Storage service for managing historical reconciliation data
 */
export class StorageService {
  /**
   * Save a reconciliation result to historical records
   */
  static saveReconciliationResult(
    result: ReconciliationResult | BatchReconciliationResult,
    type: 'single' | 'batch',
    metadata: {
      internalFileName?: string;
      providerFileName?: string;
      filePairCount?: number;
      processingTimeMs: number;
    }
  ): void {
    try {
      const records = this.getHistoricalRecords();
      
      const newRecord: HistoricalRecord = {
        id: this.generateId(),
        timestamp: new Date(),
        type,
        result: this.deepClone(result),
        metadata: { ...metadata }
      };

      records.push(newRecord);

      // Keep only the most recent records to manage storage size
      if (records.length > MAX_HISTORICAL_RECORDS) {
        records.splice(0, records.length - MAX_HISTORICAL_RECORDS);
      }

      localStorage.setItem(STORAGE_KEYS.HISTORICAL_RECORDS, JSON.stringify(records));
      this.updateVersion();
    } catch (error) {
      console.warn('Failed to save reconciliation result to localStorage:', error);
    }
  }

  /**
   * Retrieve all historical records
   */
  static getHistoricalRecords(): HistoricalRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORICAL_RECORDS);
      if (!stored) return [];

      const records = JSON.parse(stored) as HistoricalRecord[];
      
      // Parse dates back from JSON strings
      return records.map(record => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to retrieve historical records from localStorage:', error);
      return [];
    }
  }

  /**
   * Get historical records filtered by time range
   */
  static getHistoricalRecordsByTimeRange(timeRange: '7d' | '30d' | '90d' | 'all'): HistoricalRecord[] {
    const allRecords = this.getHistoricalRecords();
    
    if (timeRange === 'all') return allRecords;

    const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allRecords.filter(record => record.timestamp >= cutoffDate);
  }

  /**
   * Clear all historical records
   */
  static clearHistoricalRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORICAL_RECORDS);
    } catch (error) {
      console.warn('Failed to clear historical records:', error);
    }
  }

  /**
   * Get analytics preferences
   */
  static getAnalyticsPreferences(): AnalyticsPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS_PREFERENCES);
      if (!stored) {
        return this.getDefaultPreferences();
      }

      return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
    } catch (error) {
      console.warn('Failed to retrieve analytics preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Save analytics preferences
   */
  static saveAnalyticsPreferences(preferences: Partial<AnalyticsPreferences>): void {
    try {
      const current = this.getAnalyticsPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.ANALYTICS_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save analytics preferences:', error);
    }
  }

  /**
   * Get storage statistics
   */
  static getStorageStats(): {
    recordCount: number;
    storageUsed: string;
    oldestRecord?: Date;
    newestRecord?: Date;
  } {
    const records = this.getHistoricalRecords();
    
    let storageUsed = '0 KB';
    try {
      const totalSize = Object.keys(localStorage)
        .filter(key => key.startsWith('mini-recon-tool'))
        .reduce((total, key) => total + (localStorage.getItem(key)?.length || 0), 0);
      
      storageUsed = `${(totalSize / 1024).toFixed(1)} KB`;
    } catch (error) {
      // Ignore storage calculation errors
    }

    return {
      recordCount: records.length,
      storageUsed,
      oldestRecord: records.length > 0 ? records[0].timestamp : undefined,
      newestRecord: records.length > 0 ? records[records.length - 1].timestamp : undefined
    };
  }

  /**
   * Export historical data for backup
   */
  static exportHistoricalData(): string {
    const data = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      records: this.getHistoricalRecords(),
      preferences: this.getAnalyticsPreferences()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import historical data from backup
   */
  static importHistoricalData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.records && Array.isArray(data.records)) {
        // Validate and restore records
        const validRecords = data.records
          .map((record: any) => ({
            ...record,
            timestamp: new Date(record.timestamp)
          }))
          .filter((record: any) => this.isValidRecord(record))
          .slice(-MAX_HISTORICAL_RECORDS); // Keep only recent records

        localStorage.setItem(STORAGE_KEYS.HISTORICAL_RECORDS, JSON.stringify(validRecords));
      }

      if (data.preferences && typeof data.preferences === 'object') {
        this.saveAnalyticsPreferences(data.preferences);
      }

      this.updateVersion();
      return true;
    } catch (error) {
      console.error('Failed to import historical data:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getDefaultPreferences(): AnalyticsPreferences {
    return {
      defaultTimeRange: '30d',
      enableAutoInsights: true,
      anomalyThreshold: 10,
      preferredChartTypes: ['line', 'bar', 'pie']
    };
  }

  private static updateVersion(): void {
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
  }

  private static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private static isValidRecord(record: any): boolean {
    return (
      record &&
      typeof record.id === 'string' &&
      record.timestamp instanceof Date &&
      (record.type === 'single' || record.type === 'batch') &&
      record.result &&
      record.metadata &&
      typeof record.metadata.processingTimeMs === 'number'
    );
  }
}

/**
 * React hook for analytics preferences
 */
export function useAnalyticsPreferences() {
  const getPreferences = () => StorageService.getAnalyticsPreferences();
  const updatePreferences = (preferences: Partial<AnalyticsPreferences>) => {
    StorageService.saveAnalyticsPreferences(preferences);
  };

  return { getPreferences, updatePreferences };
}
