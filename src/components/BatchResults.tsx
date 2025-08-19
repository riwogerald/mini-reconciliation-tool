import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Clock, 
  BarChart3, 
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { TransactionTable } from './TransactionTable';
import { BatchReconciliationResult, FilePair } from '../types/transaction';
import { exportBatchResults } from '../utils/batchReconciliation';

interface BatchResultsProps {
  result: BatchReconciliationResult;
  isProcessing?: boolean;
  progress?: {
    current: number;
    total: number;
    currentPair?: FilePair;
  };
}

export const BatchResults: React.FC<BatchResultsProps> = ({
  result,
  isProcessing = false,
  progress
}) => {
  const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const togglePairExpansion = (pairId: string) => {
    setExpandedPairs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pairId)) {
        newSet.delete(pairId);
      } else {
        newSet.add(pairId);
      }
      return newSet;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportBatchResults(result);
    } catch (error) {
      console.error('Export failed:', error);
      // Could add toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => value.toFixed(1);

  if (isProcessing && progress) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Batch Reconciliation
          </h3>
          <p className="text-gray-600 mb-4">
            Processing {progress.current} of {progress.total} file pairs...
          </p>
          
          {progress.currentPair && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Currently processing: <span className="font-medium">
                  {progress.currentPair.internalFile.name} ↔ {progress.currentPair.providerFile.name}
                </span>
              </p>
            </div>
          )}

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {formatPercentage((progress.current / progress.total) * 100)}% complete
          </p>
        </div>
      </div>
    );
  }

  const { aggregateStats } = result;
  const successRate = (aggregateStats.successfulPairs / aggregateStats.totalFilePairs) * 100;

  return (
    <div className="space-y-8">
      {/* Aggregate Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Batch Reconciliation Complete
            </h2>
            <p className="text-gray-600">
              Processed {aggregateStats.totalFilePairs} file pairs in {formatDuration(result.processingTimeMs)}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export All Results'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {aggregateStats.successfulPairs}
                </p>
                <p className="text-sm text-gray-600">Successful Pairs</p>
                <p className="text-xs text-green-600">
                  {formatPercentage(successRate)}% success rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {aggregateStats.totalMatched.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Matched</p>
                <p className="text-xs text-blue-600">
                  {formatPercentage(aggregateStats.overallMatchRate)}% match rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {aggregateStats.totalInternalOnly.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Internal Only</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(aggregateStats.averageProcessingTime)}
                </p>
                <p className="text-sm text-gray-600">Avg. Time/Pair</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Pair Results */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Individual File Pair Results
        </h3>

        <div className="space-y-4">
          {result.filePairs.map((pair, index) => (
            <div key={pair.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => togglePairExpansion(pair.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {pair.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : pair.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900">
                      Pair {index + 1}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {pair.internalFile.name} ↔ {pair.providerFile.name}
                    </p>
                    {pair.status === 'completed' && pair.result && (
                      <p className="text-xs text-gray-500">
                        {pair.result.stats.matched} matches out of {pair.result.stats.totalInternal} internal transactions
                      </p>
                    )}
                    {pair.status === 'failed' && (
                      <p className="text-xs text-red-600">{pair.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {pair.status === 'completed' && pair.result && (
                    <span className="text-sm text-gray-600">
                      {formatPercentage(pair.result.stats.matchRate)}% match
                    </span>
                  )}
                  {expandedPairs.has(pair.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedPairs.has(pair.id) && pair.status === 'completed' && pair.result && (
                <div className="border-t border-gray-200 p-4 space-y-6">
                  {/* Pair Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-800">
                        {pair.result.matched.length}
                      </p>
                      <p className="text-sm text-green-600">Matched</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-lg font-semibold text-amber-800">
                        {pair.result.internalOnly.length}
                      </p>
                      <p className="text-sm text-amber-600">Internal Only</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-lg font-semibold text-red-800">
                        {pair.result.providerOnly.length}
                      </p>
                      <p className="text-sm text-red-600">Provider Only</p>
                    </div>
                  </div>

                  {/* Transaction Tables */}
                  <div className="space-y-6">
                    {pair.result.matched.length > 0 && (
                      <TransactionTable
                        title={`Matched Transactions (${pair.result.matched.length})`}
                        icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                        data={pair.result.matched}
                        type="matched"
                        colorScheme="green"
                        exportFilename={`pair-${index + 1}-matched`}
                      />
                    )}

                    {pair.result.internalOnly.length > 0 && (
                      <TransactionTable
                        title={`Internal Only (${pair.result.internalOnly.length})`}
                        icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                        data={pair.result.internalOnly}
                        type="internal-only"
                        colorScheme="amber"
                        exportFilename={`pair-${index + 1}-internal-only`}
                      />
                    )}

                    {pair.result.providerOnly.length > 0 && (
                      <TransactionTable
                        title={`Provider Only (${pair.result.providerOnly.length})`}
                        icon={<XCircle className="w-5 h-5 text-red-600" />}
                        data={pair.result.providerOnly}
                        type="provider-only"
                        colorScheme="red"
                        exportFilename={`pair-${index + 1}-provider-only`}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-5 h-5" />
            <span>Complete Report Bundle</span>
          </button>
          
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Summary Report</p>
            <p className="text-xs text-gray-500">Text file with aggregate statistics</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Individual CSVs</p>
            <p className="text-xs text-gray-500">Separate files for each pair's results</p>
          </div>
        </div>
      </div>
    </div>
  );
};
