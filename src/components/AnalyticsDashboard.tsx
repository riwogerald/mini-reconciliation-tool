import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Download,
  Calendar,
  Settings,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  TrendChart, 
  AmountDistributionChart, 
  StatusBreakdownChart, 
  MismatchPatternsChart,
  PerformanceMetricsCard 
} from './AnalyticsCharts';
import { 
  ReconciliationResult, 
  BatchReconciliationResult 
} from '../types/transaction';
import { 
  AnalyticsData, 
  AnalyticsInsight, 
  HistoricalRecord 
} from '../types/analytics';
import { 
  generateAnalyticsData, 
  filterRecordsByTimeRange,
  generateExecutiveSummary 
} from '../utils/analytics';
import { StorageService } from '../utils/storageService';

interface AnalyticsDashboardProps {
  currentResult: ReconciliationResult | BatchReconciliationResult;
  onExportPDF: (analyticsData: AnalyticsData) => void;
}

export function AnalyticsDashboard({ currentResult, onExportPDF }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    refreshAnalytics();
  }, [currentResult, timeRange]);

  const refreshAnalytics = async () => {
    setIsLoading(true);
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const historicalRecords = StorageService.getHistoricalRecordsByTimeRange(timeRange);
      const analytics = generateAnalyticsData(currentResult, historicalRecords);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to generate analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const dataStr = StorageService.exportHistoricalData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reconciliation-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all historical data? This action cannot be undone.')) {
      StorageService.clearHistoricalRecords();
      refreshAnalytics();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Generating analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to generate analytics data</p>
        <button 
          onClick={refreshAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500">Advanced insights and historical trends</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Export buttons */}
          <button
            onClick={() => onExportPDF(analyticsData)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Data</span>
          </button>

          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preferences panel */}
      {showPreferences && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Preferences</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Historical Records: {StorageService.getStorageStats().recordCount}</p>
              <p className="text-sm text-gray-600">Storage Used: {StorageService.getStorageStats().storageUsed}</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Key insights */}
      {analyticsData.insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Key Insights</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analyticsData.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Performance metrics */}
      <PerformanceMetricsCard metrics={analyticsData.performanceMetrics} />

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TrendChart data={analyticsData.historicalTrends} timeRange={timeRange} />
        <StatusBreakdownChart data={analyticsData.statusBreakdown} />
        <AmountDistributionChart data={analyticsData.amountDistribution} />
        <MismatchPatternsChart data={analyticsData.mismatchPatterns} />
      </div>

      {/* Executive summary */}
      {analyticsData.historicalTrends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Executive Summary</span>
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {generateExecutiveSummary(analyticsData)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

interface InsightCardProps {
  insight: AnalyticsInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const getIconAndColors = () => {
    switch (insight.type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-800'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800'
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor, titleColor } = getIconAndColors();

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4`}>
      <div className="flex items-start space-x-3">
        <div className={iconColor}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className={`font-semibold text-sm ${titleColor}`}>{insight.title}</h4>
            {insight.value && (
              <span className={`text-xs px-2 py-1 rounded ${bgColor} ${titleColor} font-medium`}>
                {insight.value}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              insight.impact === 'high' ? 'bg-red-100 text-red-700' :
              insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {insight.impact} impact
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
          
          {insight.recommendation && (
            <p className="text-xs text-gray-600 italic">
              💡 {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnalyticsHeaderProps {
  totalRecords: number;
  timeRange: string;
  onRefresh: () => void;
}

function AnalyticsHeader({ totalRecords, timeRange, onRefresh }: AnalyticsHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Based on {totalRecords} historical reconciliation{totalRecords !== 1 ? 's' : ''} 
            {timeRange !== 'all' && ` (${timeRange})`}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
