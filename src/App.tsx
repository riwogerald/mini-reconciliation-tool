import React, { useState } from 'react';
import { BarChart3, Upload, RefreshCw } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { ReconciliationSummary } from './components/ReconciliationSummary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ParsedFile, ReconciliationResult } from './types/transaction';
import { reconcileTransactions } from './utils/reconciliation';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function App() {
  const [internalFile, setInternalFile] = useState<ParsedFile | null>(null);
  const [providerFile, setProviderFile] = useState<ParsedFile | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReconciliation = async () => {
    if (!internalFile || !providerFile) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Add realistic processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = reconcileTransactions(internalFile.data, providerFile.data);
      setReconciliationResult(result);
    } catch (error) {
      console.error('Reconciliation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred during reconciliation');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setInternalFile(null);
    setProviderFile(null);
    setReconciliationResult(null);
    setError(null);
  };

  const canReconcile = internalFile && providerFile && !isProcessing;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 sm:p-3 rounded-xl shadow-lg">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Mini Reconciliation Tool
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Compare transaction files and identify discrepancies
                  </p>
                </div>
              </div>
              {(internalFile || providerFile) && (
                <button
                  onClick={resetAll}
                  className="flex items-center space-x-2 px-3 py-2 sm:px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset All</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Error Display */}
          {error && (
            <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          <section className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Upload Transaction Files
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Upload your internal system export and provider statement to identify discrepancies
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <FileUpload
                label="Internal System Export"
                onFileProcessed={setInternalFile}
                currentFile={internalFile || undefined}
                onClearFile={() => {
                  setInternalFile(null);
                  setReconciliationResult(null);
                  setError(null);
                }}
              />
              <FileUpload
                label="Provider Statement"
                onFileProcessed={setProviderFile}
                currentFile={providerFile || undefined}
                onClearFile={() => {
                  setProviderFile(null);
                  setReconciliationResult(null);
                  setError(null);
                }}
              />
            </div>
          </section>

          {/* Reconcile Button */}
          {(internalFile || providerFile) && (
            <section className="mb-8 sm:mb-12 text-center">
              <div className="inline-flex flex-col items-center space-y-4">
                <button
                  onClick={handleReconciliation}
                  disabled={!canReconcile}
                  className={`relative px-8 py-4 sm:px-12 sm:py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                    canReconcile
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-3">
                      <LoadingSpinner size="sm" />
                      <span>Processing Reconciliation...</span>
                    </div>
                  ) : (
                    'Run Reconciliation'
                  )}
                </button>
                
                {!canReconcile && (internalFile || providerFile) && !isProcessing && (
                  <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border">
                    Please upload both files to run reconciliation
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Results Section */}
          {reconciliationResult && (
            <section className="space-y-8 sm:space-y-12">
              <ReconciliationSummary stats={reconciliationResult.stats} />
              
              <div className="space-y-6 sm:space-y-8">
                <TransactionTable
                  title="Matched Transactions"
                  icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
                  data={reconciliationResult.matched}
                  type="matched"
                  colorScheme="green"
                />
                
                <TransactionTable
                  title="Internal File Only"
                  icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />}
                  data={reconciliationResult.internalOnly}
                  type="internal-only"
                  colorScheme="amber"
                />
                
                <TransactionTable
                  title="Provider File Only"
                  icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
                  data={reconciliationResult.providerOnly}
                  type="provider-only"
                  colorScheme="red"
                />
              </div>
            </section>
          )}

          {/* Welcome State */}
          {!internalFile && !providerFile && (
            <section className="text-center py-12 sm:py-16 lg:py-24">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-8">
                  <Upload className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-6" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Welcome to the Reconciliation Tool
                </h3>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
                  Upload your internal system export and provider statement files to identify transaction discrepancies with precision and ease.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Smart Matching</h4>
                    <p className="text-sm text-gray-600 text-center">Compare transactions by reference with intelligent algorithms</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Detect Mismatches</h4>
                    <p className="text-sm text-gray-600 text-center">Identify amount and status discrepancies automatically</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Export Results</h4>
                    <p className="text-sm text-gray-600 text-center">Download detailed reports in CSV format</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;